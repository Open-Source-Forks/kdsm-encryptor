import { NextResponse } from 'next/server';
import { Databases, Query, ID, Client } from 'node-appwrite';
import { getUserFromSession, config, collections, createSessionClient } from '@/lib/appwrite/kdsm';


// Initialize Appwrite client
const client = new Client()
  .setEndpoint(config.endpoint)
  .setProject(config.project_id)
  .setKey(config.api_key);
/**
 * GET /api/auth/security-questions
 * Retrieves security questions
 */
export async function GET(request) {
  try {
    const databases = new Databases(client);

    // Query security questions for the user
    const response = await databases.listDocuments(
      config.database,
      collections.securityQuestions,
      [
        Query.orderDesc('$createdAt')
      ]
    );

    return NextResponse.json({
      success: true,
      questions: response.documents,
      total: response.total
    });

  } catch (error) {
    console.error('Error fetching security questions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch security questions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/security-questions
 * Creates or updates security questions for the authenticated user
 * 
 * Request body:
 * {
 *   questions: [
 *     { question: string, answer: string },
 *     { question: string, answer: string },
 *     ...
 *   ]
 * }
 */
export async function POST(request) {
  try {
    // Get the authenticated user
    const user = await getUserFromSession(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login.' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { questions } = body;

    // Validate input
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'Invalid input. Please provide an array of questions.' },
        { status: 400 }
      );
    }

    // Validate each question
    for (const q of questions) {
      if (!q.question || !q.answer) {
        return NextResponse.json(
          { error: 'Each question must have both question and answer fields.' },
          { status: 400 }
        );
      }
    }

    // Create admin client to interact with the database
    const { client } = createAdminClient();
    const databases = new Databases(client);

    // Create documents for each security question
    const createdQuestions = [];
    
    for (const q of questions) {
      const document = await databases.createDocument(
        config.database,
        collections.securityQuestions,
        ID.unique(),
        {
          userId: user.$id,
          question: q.question,
          answer: q.answer, // Note: In production, you should hash the answer
          createdAt: new Date().toISOString()
        }
      );
      
      createdQuestions.push(document);
    }

    return NextResponse.json({
      success: true,
      message: 'Security questions saved successfully',
      questions: createdQuestions,
      total: createdQuestions.length
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating security questions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create security questions' },
      { status: 500 }
    );
  }
}
