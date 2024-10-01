// https://github.com/TanStack/query/discussions/2772#discussioncomment-7566892
import '@tanstack/react-query';

import { Routine } from './types.ts';

interface Meta extends Record<string, unknown> {
  routine?: Routine;
}

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: Meta;
    mutationMeta: Meta;
  }
}
