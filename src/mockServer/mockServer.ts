import qs from 'qs';
import { StatusCodes } from 'http-status-codes';
import { v4 } from 'uuid';
import {
  createServer,
  Model,
  Factory,
  RestSerializer,
  Response,
} from 'miragejs';
import {
  API_ROUTES,
  buildGetInvitationRoute,
  buildGetMember,
  buildGetMembersRoute,
  buildGetPublicMemberRoute,
  buildGetPublicMembersRoute,
  SIGN_IN_ROUTE,
  SIGN_IN_WITH_PASSWORD_ROUTE,
  SIGN_UP_ROUTE,
} from '../api/routes';
import { Invitation, Item, Member } from '../types';

type Database = {
  currentMember?: Member;
  items?: Item[];
  invitations?: Invitation[];
  // itemMemberships?: ItemMembership[],
  members?: Member[];
};

const { GET_CURRENT_MEMBER_ROUTE } = API_ROUTES;

const ApplicationSerializer = RestSerializer.extend({
  root: false,
  embed: true,
});

const DEFAULT_MEMBER = {
  id: 'mock-current-user',
  email: 'mock-email',
  name: 'mock-name',
  extra: {},
  createdAt: Date.now().toLocaleString(),
  updatedAt: Date.now().toLocaleString(),
};

const UnauthenticatedError = new Response(
  StatusCodes.UNAUTHORIZED,
  { some: 'header' },
  { errors: ['User is not authenticated !!!'] },
);

const NotFoundError = new Response(
  StatusCodes.NOT_FOUND,
  { some: 'header' },
  { errors: ['element not found'] },
);

export const buildDatabase = ({
  currentMember = DEFAULT_MEMBER,
  items = [],
  invitations = [],
  members,
}: Partial<Database> = {}) => ({
  currentMember,
  items,
  invitations,
  members: members ?? [currentMember],
});

export const mockServer = ({
  currentMember,
  urlPrefix,
  database = buildDatabase(),
  externalUrls = [],
}: // errors = {},
  {
    currentMember?: Member;
    urlPrefix?: string;
    database?: Database;
    externalUrls?: string[];
    errors?: any;
  } = {}) => {
  const checkIsAuthenticated = () => Boolean(currentMember?.id);
  const { members, invitations } = database;
  // mocked errors
  // const {
  // } = errors;

  return createServer({
    // environment
    urlPrefix,
    models: {
      invitation: Model,
      item: Model,
      member: Model,
    },
    factories: {
      item: Factory.extend<Item>({
        id: () => v4(),
        extra: () => ({}),
        description: () => '',
        path: () => 'path',
        type: () => 'folder',
        name: (idx: number) => `member-${idx}`,
        createdAt: Date.now().toLocaleString(),
        updatedAt: Date.now().toLocaleString(),
      }),
      member: Factory.extend<Member>({
        id: () => v4(),
        extra: () => ({}),
        email: (idx: number) => `member-email-${idx}`,
        name: (idx: number) => `member-${idx}`,
        createdAt: Date.now().toLocaleString(),
        updatedAt: Date.now().toLocaleString(),
      }),
      invitation: Factory.extend<Invitation>({
        id: () => v4(),
        permission: () => 'read',
        email: (idx: number) => `invitation-email-${idx}`,
        createdAt: Date.now().toLocaleString(),
      }),
    },

    serializers: {
      item: ApplicationSerializer,
      invitation: ApplicationSerializer,
      member: ApplicationSerializer,
    },
    seeds(server) {
      members?.forEach((m) => {
        server.create('member', m);
      });
      invitations?.forEach((inv) => {
        server.create('invitation', inv);
      });
    },
    routes() {
      // invitation
      this.get(`/${buildGetInvitationRoute(':id')}`, (schema, request) => {
        const {
          params: { id },
        } = request;

        const invitation = schema.find('invitation', id);
        if (!invitation) {
          return NotFoundError;
        }

        return invitation;
      });

      // auth
      this.post(`/${SIGN_IN_ROUTE}`, () => {
        if (currentMember) {
          return new Response(StatusCodes.BAD_REQUEST);
        }

        return new Response(StatusCodes.NO_CONTENT);
      });
      this.post(`/${SIGN_IN_WITH_PASSWORD_ROUTE}`, (schema, request) => {
        if (currentMember) {
          return new Response(StatusCodes.BAD_REQUEST);
        }

        const { email, password } = JSON.parse(request.requestBody);

        const member = schema.findBy('member', { email });
        if (member?.extra?.password === password) {
          return new Response(StatusCodes.NO_CONTENT);
        }

        return UnauthenticatedError;
      });

      this.post(`/${SIGN_UP_ROUTE}`, () => {
        if (currentMember) {
          return new Response(StatusCodes.BAD_REQUEST);
        }

        return new Response(StatusCodes.NO_CONTENT);
      });

      // members
      this.get(`/${GET_CURRENT_MEMBER_ROUTE}`, () => {
        if (!currentMember && !checkIsAuthenticated()) {
          return UnauthenticatedError;
        }

        return currentMember!;
      });

      this.get(`/${buildGetMember(':id')}`, (schema, request) => {
        if (!checkIsAuthenticated()) {
          return UnauthenticatedError;
        }

        const {
          params: { id },
        } = request;
        const member = schema.find('member', id);

        if (!member) {
          return new Response(StatusCodes.NOT_FOUND);
        }
        return member;
      });

      this.get(`/${buildGetPublicMemberRoute(':id')}`, (schema, request) => {
        const {
          params: { id },
        } = request;
        const member = schema.find('member', id);
        if (!member) {
          return new Response(StatusCodes.NOT_FOUND);
        }
        return member;
      });

      this.get(`/${buildGetPublicMembersRoute([])}`, (schema, request) => {
        let { id: memberIds } = qs.parse(request.url.split('?')[1]);
        if (typeof memberIds === 'string') {
          memberIds = [memberIds];
        }
        const ids = memberIds as string[];
        return schema.all('member').filter(({ id }) => ids.includes(id));
      });

      this.get(`/${buildGetMembersRoute([])}`, (schema, request) => {
        if (!checkIsAuthenticated()) {
          return UnauthenticatedError;
        }

        let { id: memberIds } = qs.parse(request.url.split('?')[1]);
        if (typeof memberIds === 'string') {
          memberIds = [memberIds];
        }
        const ids = memberIds as string[];
        return schema.all('member').filter(({ id }) => ids.includes(id));
      });

      // passthrough external urls
      externalUrls.forEach((url) => {
        this.passthrough(url);
      });
    },
  });
};

export default mockServer;
