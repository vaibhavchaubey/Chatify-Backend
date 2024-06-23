import { userSocketIDs } from '../src/app.js';

const getOtherMember = (members, userId) =>
  members.find((member) => member._id.toString() !== userId.toString());

const getSockets = (users = []) => {
  const sockets = users.map((user) => userSocketIDs.get(user._id.toString()));

  return sockets;
};

export { getOtherMember, getSockets };
