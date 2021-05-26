import React, { useEffect } from 'react';
import { hooks, useMutation } from './configureQueryClient';

const App = () => {
  const { mutate: postItem }: any = useMutation('postItem');

  useEffect(() => {
    postItem({ id: 'wef', parentId: 'wefoik' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: user }: any = hooks.useOwnItems();

  return <div>hello: {user}</div>;
};

export default App;
