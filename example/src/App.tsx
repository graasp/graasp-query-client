import React from 'react';
import { hooks, useMutation } from './configureQueryClient';

const App = () => {
  const { mutate: postItem }: any = useMutation('postItem');
  const { data: user, isLoading }: any = hooks.useOwnItems();

  const onClick = () => {
    // use the post item mutation
    // the payload is incorrect, so it will fail
    postItem({ id: 'myitemid', parentId: 'myparentid' });
  };

  const renderMyItems = () => {
    if (isLoading) {
      return 'Fetching data...';
    }

    return <div>My own Items: {JSON.stringify(user)}</div>;
  };

  return (
    <>
      <button type="button" onClick={onClick}>
        Post an Item
      </button>
      {renderMyItems()}
    </>
  );
};

export default App;
