// server.js

const Koa = require('koa');
const Body = require('koa-bodyparser');
const router = require('koa-router')();
const {graphqlKoa, graphiqlKoa} = require('apollo-server-koa');
const {makeExecutableSchema} = require('graphql-tools');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const cors = require('@koa/cors');

const app = new Koa();
const PORT = 8090;

// 模拟数据
const users = [
  {
    id: 1,
    name: '马大帅',
    date: new Date(2018, 5, 20)
  },
  {
    id: 2,
    name: '范德彪',
    date: new Date(2018, 5, 21)
  },
];

const typeDefs = `
    scalar Date
    type User{
        id:Int!
        name:String!
        date: Date!
    }
    type Query {
        users(id:Int!): [User]
        user(id:Int!, name: String!):User
    }
    type Mutation {
        addUser(name:String!):User
    }
    schema {
        query: Query
        mutation: Mutation
    }
`;

const resolvers = {
    Query: {    // 对应到typeDefs中的 type Query
        users(root, args, context) {
            return users;
        },
        user(root, args, context, info) {
          return {id: args.id, name: args.name};
      }
    },
    Mutation: { // 对应到typeDefs中的 Mutation
        addUser(root, args, context) {
            return {id: parseInt(Math.random() * 100), name: args.name};
        }
    },
    Date: new GraphQLScalarType({ // 自定义标量类型
        name: 'Date',
        description: 'Date custom scalar type',
        parseValue(value) {
          return new Date(value); // 从客户端来的数据
        },
        serialize(value) {
          return value.getTime(); // 发送给客户端的数据
        },
        parseLiteral(ast) {
          if (ast.kind === Kind.INT) {
            return parseInt(ast.value, 10);
          }
          return null;
        },
    }),
};


const myGraphQLSchema = makeExecutableSchema({
    typeDefs,
    resolvers
});

app.use(Body());
app.use(cors());


router.post('/graphql', graphqlKoa({
    schema: myGraphQLSchema,
}));
router.get('/graphql', graphqlKoa({
    schema: myGraphQLSchema,
}));

router.get( // 在浏览器里使用GraphiQL（可以理解成GraphQL领域的postman）
  '/graphiql',
  graphiqlKoa({
    endpointURL: '/graphql',
  }),
);

app.use(router.routes());
app.use(router.allowedMethods());
app.listen(PORT, ()=>console.log('app run in localhost:' + PORT));











// 'use strict'

// const path = require('path')
// const Koa = require('koa')
// const app = new Koa()
// const { ApolloServer, gql } = require('apollo-server-koa')
// const {makeExecutableSchema} = require('graphql-tools');
// const { GraphQLScalarType } = require('graphql');
// const { Kind } = require('graphql/language');


// /**
//  * 在 typeDefs 里定义 GraphQL Schema
//  *
//  * 例如：我们定义了一个查询，名为 book，类型是 Book
//  */
// const typeDefs = gql`
//   type Query {
//     book: Book
//     hello: String
//   }

//   enum BookStatus {
//     DELETED
//     NORMAL
//   }

//   type Book {
//     id: ID
//     name: String
//     price: Float
//     status: BookStatus
//   }

//   type Mutation {
//     addBook(name:String!):Book
// }

//   schema {
//     query: Query
//     mutation: Mutation
// }
// `;

// const BookStatus = {
//   DELETED: 0,
//   NORMAL: 1
// }
// /**
//  * 在这里定义对应的解析器
//  *
//  * 例如:
//  *   针对查询 hello, 定义同名的解析器函数，返回字符串 "hello world!"
//  *   针对查询 book，定义同名的解析器函数，返回预先定义好的对象（实际场景可能返回来自数据库或其他接口的数据）
//  */
// const resolvers = {

//   // Apollo Server 允许我们将实际的枚举映射挂载到 resolvers 中（这些映射关系通常维护在服务端的配置文件或数据库中）
//   // 任何对于此枚举的数据交换，都会自动将枚举值替换为枚举名，避免了枚举值泄露到客户端的问题
//   BookStatus,

//   Query: {
//     hello: () => 'hello world!',
//     book: (parent, args, context, info) => ({
//       name: '地球往事',
//       price: 66.3,
//       status: BookStatus.NORMAL
//     }),
//   },
//   Mutation: { // 对应到typeDefs中的 Mutation
//     addBook(root, args, context) {
//       return { name: args.name, price: args.price };
//     }
//   },

// };

// // 通过 schema、解析器、 Apollo Server 的构造函数，创建一个 server 实例
// const server = new ApolloServer({ typeDefs, resolvers })
// // 将 server 实例以中间件的形式挂载到 app 上
// server.applyMiddleware({ app })
// // 启动 web 服务
// app.listen({ port: 4000 }, () =>
//   console.log(`🚀 Server ready at http://localhost:4000/graphql`)
// )
