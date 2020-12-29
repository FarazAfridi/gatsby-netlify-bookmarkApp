const { ApolloServer, gql } = require("apollo-server-lambda");
var faunadb = require("faunadb"),
  q = faunadb.query;

const typeDefs = gql`
  type Query {
    bookmarks: [Bookmark]
  }
  type Bookmark {
    id: ID!
    title: String!
    url: String!
  }
  type Mutation {
    addBookmark(title: String!, url: String!): Bookmark
    removeBookmark(id: ID!): Bookmark
  }
`;

const resolvers = {
  Query: {
    bookmarks: async () => {
      try {
        var adminClient = new faunadb.Client({
          secret: process.env.FAUNA_DB_SECRET,
        });
        const result = await adminClient.query(
          q.Map(
            q.Paginate(q.Match(q.Index("url"))),
            q.Lambda((x) => q.Get(x))
          )
        );
        console.log(result);

        return result.data.map((d) => {
          return {
            id: d.ref.id,
            title: d.data.title,
            url: d.data.url,
          };
        });
      } catch (err) {
        console.log(err);
      }
    },
  },
  Mutation: {
    addBookmark: async (_, { title, url }) => {
      try {
        var adminClient = new faunadb.Client({
          secret: process.env.FAUNA_DB_SECRET,
        });
        const result = await adminClient.query(
          q.Create(q.Collection("bookmarks"), {
            data: { title, url },
          })
        );
        return result.data.data;
      } catch (err) {
        console.log(err);
      }
    },
    removeBookmark: async (_, { id }) => {
      try {
        console.log(id)
        const client = new faunadb.Client({
          secret: process.env.FAUNA_DB_SECRET,
        });

        const result = await client.query(
          q.Delete(q.Ref(q.Collection("bookmarks"), id))
        );

        console.log(result);
        return {
          id: result.ref.id,
        };
      } catch (error) {
        console.log("Error in Deleting Data : ", error);
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = server.createHandler();

module.exports = { handler };
