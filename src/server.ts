import * as express from 'express';
import * as bodyParser from 'body-parser';
import {
  ApolloServer,
  gql,
  ApolloError
} from 'apollo-server-express';
import * as admin from 'firebase-admin';

const serviceAccount = require('../service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();

// GraphQL types
const typeDefs = gql`
  type Question {
    id: ID!
    question: String
    contents: String
    answers: [Answer!]!
  }

  type Answer {
    contents: String
    questionId: String!
  }

  type Query {
    questions: [Question!]!
    question(id: String!): Question
    answers: [Answer!]!
    answer(id: String!): Answer
  }

  type Mutation {
    addQuestion(question: String, contents: String): Question
    addAnswer(questionId: ID!, contents: String): Answer
  }
`;

// interfaces

interface IQuestion {
  id: string
  question: string
  contents: string
}

interface IAnswer {
  id: string
  contents: string
  questionId: string
}

const resolvers = {
  Query: {
    async questions() {
      try {
        const questionSnapshots = await db.collection('questions').get();
        return questionSnapshots.docs.map((snapshot) => {
          return snapshot.data();
        });
      } catch (e) {
        throw new ApolloError(e);
      }
    },
    async question(root: null, args: any) {
      try {
        const { id } = args;
        const questionDoc = await db.collection('questions').doc(id).get();
        return questionDoc.data();
      } catch (e) {
        throw new ApolloError(e);
      }
    },
    async answers() {
      try {
        const answerSnapshots = await db.collection('answers').get();
        return answerSnapshots.docs.map((snapshot) => {
          return snapshot.data();
        });
      } catch (e) {
        throw new ApolloError(e);
      }
    }
  },
  Mutation: {
    async addQuestion(root: null, args: any) {
      try {
        const { question, contents } = args;
        const newQuestionRef = db.collection('questions').doc();
        await newQuestionRef.set({
          id: newQuestionRef.id,
          question,
          contents,
        });
        const newQuestionSnapshot = await newQuestionRef.get();
        return newQuestionSnapshot.data();
      } catch (e) {
        throw new ApolloError(e);
      }
    },
    async addAnswer(root: null, args: any) {
      try {
        const { questionId, contents } = args;
        const newAnswerRef = db.collection('answers').doc();
        await newAnswerRef.set({
          id: newAnswerRef.id,
          contents,
          questionId,
        });
        const newAnswerSnapshot = await newAnswerRef.get();
        return newAnswerSnapshot.data();
      } catch (e) {
        throw new ApolloError(e);
      }
    }
  },
  Question: {
    async answers(question: IQuestion) {
      try {
        const answerSnapshot = await db.collection('answers').where('questionId', '==', question.id).get();
        return answerSnapshot.docs.map((snapshot) => {
          return snapshot.data();
        });
      } catch (e) {
        throw new ApolloError(e);
      }
    }
  }
}

// graphql server
const server = new ApolloServer({
  typeDefs,
  resolvers
});
server.applyMiddleware({ app });

// server start!
app.listen(7777, () => {
  console.log('Server ready!');
});