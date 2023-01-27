const users = [];
const todo = [];

function generateId() {
  let prevUserId = 0;
  let prevTodoId = 0;
  return function (type) {
    switch (type) {
      case "user":
        return ++prevUserId;
      case "todo":
        return ++prevTodoId;
      default:
        return null;
    }
  };
}

const idGenerator = generateId();

function createUser(name, username, email) {
  const existUser = users.find(
    (user) => user.email.toLowerCase() === email.toLowerCase()
  );

  if (existUser) {
    throw new Error("User email existe");
  }
  const user = {
    id: idGenerator("user"),
    name,
    username,
    email,
    enabled: true,
  };
  users.push(user);
  return user;
}

function updateUser(idOrEmail, { name, username }) {
  const user = users.find(
    (user) =>
      user.id === idOrEmail ||
      user.email.toLowerCase() === idOrEmail.toLowerCase()
  );
  if (!user) {
    throw new Error("User not found");
  }

  name && (user.name = name);
  username && (user.username = username);
  return user;
}

funct