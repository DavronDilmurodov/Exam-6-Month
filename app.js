const http = require("http");
const Io = require("./io");

const Todo = new Io("./db/todo.json");

const bodyParser = (req) => {
  return new Promise((resolve, reject) => {
    try {
      req.on("data", (chunk) => {
        resolve(JSON.parse(chunk));
      });
    } catch (error) {
      reject(error);
    }
  });
};

const callBack = async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.url === "/" && req.method === "POST") {
    const todos = await Todo.read();
    req.body = await bodyParser(req);
    const createdAt = new Date();
    const id = (todos[todos.length - 1]?.id || 0) + 1;
    const { title, text, isCompleted } = req.body;
    const newTodo = {
      id,
      title,
      text,
      createdAt,
      isCompleted,
    };
    await Todo.write(todos.length ? [...todos, newTodo] : [newTodo]);
    res.writeHead(201);
    res.end(JSON.stringify({ message: "SUCCESS" }));
  } else if (req.url === "/" && req.method === "DELETE") {
    const todos = await Todo.read();
    req.body = await bodyParser(req);
    const { id } = req.body;
    const newTodos = todos.filter((todo) => todo.id !== id);
    await Todo.write(newTodos);
    res.writeHead(200);
    res.end(JSON.stringify(newTodos));
  } else if (req.url === "/" && req.method === "PUT") {
    const todos = await Todo.read();
    req.body = await bodyParser(req);
    const { id, title, text, isCompleted } = req.body;
    const newTodos = todos.map((todo) => {
      if (todo.id === id) {
        todo.title = title;
        todo.text = text;
        todo.isCompleted = isCompleted;
      }
      return todo;
    });
    await Todo.write(newTodos);
    res.writeHead(200);
    res.end(JSON.stringify(newTodos));
  } else if (req.url === "/" && req.method === "GET") {
    const data = await Todo.read();

    if (!data.length) {
      //   res.writeHead(204);
      return res.end(JSON.stringify([]));
    }
    res.writeHead(200);
    res.end(JSON.stringify(data));
  } else if (req.url === "/todo" && req.method === "PUT") {
    req.body = await bodyParser(req);
    const data = await Todo.read();
    const { id } = req.body;
    const newTodo = data.find((todo) => todo.id === id);
    res.writeHead(200);
    res.end(JSON.stringify(newTodo));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ message: "SOMETHING WRONG" }));
  }
};

const server = http.createServer(callBack);

server.listen(7007, () => {
  console.log("Server has run on 7007 port");
});
