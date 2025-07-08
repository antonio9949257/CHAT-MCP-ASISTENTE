import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { getProductInfo, addNumbers, getSystemInfo, getCurrentTime } from "@/lib/tools"; // getSystemUsername removed

// IMPORTANT! Set the GOOGLE_API_KEY environment variable in a .env.local file

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

const tools = [
    {
        functionDeclarations: [
            {
                name: "getProductInfo",
                description: "Obtiene información sobre un producto, incluyendo su precio y stock, dado un ID de producto.",
                parameters: {
                    type: "object",
                    properties: {
                        productId: {
                            type: "string",
                            description: "El identificador único del producto.",
                        },
                    },
                    required: ["productId"],
                },
            },
            {
                name: "addNumbers",
                description: "Suma dos números y devuelve el resultado.",
                parameters: {
                    type: "object",
                    properties: {
                        num1: {
                            type: "number",
                            description: "El primer número a sumar.",
                        },
                        num2: {
                            type: "number",
                            description: "El segundo número a sumar.",
                        },
                    },
                    required: ["num1", "num2"],
                },
            },
            {
                name: "getSystemInfo",
                description: "Obtiene información detallada y completa sobre el sistema operativo donde se está ejecutando el servidor. Puede especificar un tipo de información (ej. 'hostname', 'platform', 'username') para obtener solo ese dato.",
                parameters: {
                    type: "object",
                    properties: {
                        infoType: {
                            type: "string",
                            description: "El tipo específico de información del sistema a obtener (ej. 'hostname', 'platform', 'username', 'totalMemory'). Si se omite, devuelve toda la información.",
                        },
                    },
                },
            },
            {
                name: "getCurrentTime",
                description: "Obtiene la hora y fecha actual del sistema operativo.",
                parameters: {
                    type: "object",
                    properties: {},
                },
            },
        ],
    },
];


export async function POST(req: NextRequest) {
    const { history } = await req.json();

    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash-latest",
        tools: tools,
        systemInstruction: "Eres un asistente útil que puede usar herramientas para responder preguntas. Usa las herramientas disponibles cuando sea apropiado.",
    });

    // Convert our simple message format to Gemini's expected format
    const geminiHistory = history.map((msg: { author: string; content: string }) => ({
        role: msg.author === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
        history: geminiHistory,
    });

    // Get the last message from the history to send as the current prompt
    const lastUserMessage = history[history.length - 1].content;

    console.log('\n--- New Request ---');
    console.log('Sending message to Gemini:', lastUserMessage);
    console.log('With history:', JSON.stringify(geminiHistory, null, 2));

    const result = await chat.sendMessage(lastUserMessage);
    const call = result.response.functionCalls()?.[0];

    console.log('Gemini raw response:', JSON.stringify(result.response, null, 2));
    console.log('Function call detected:', call);

    if (call) {
        console.log(`[API] Gemini requested tool call: ${call.name}`, call.args);
        
        let toolResult: any;
        if (call.name === "getProductInfo") {
            toolResult = getProductInfo(call.args.productId as string);
        } else if (call.name === "addNumbers") {
            toolResult = addNumbers(call.args.num1 as number, call.args.num2 as number);
        } else if (call.name === "getSystemInfo") {
            toolResult = getSystemInfo(call.args.infoType as string);
        } else if (call.name === "getCurrentTime") {
            toolResult = getCurrentTime();
        } else {
             console.error('Unknown tool requested:', call.name);
             return NextResponse.json({ response: "Unknown tool requested." }, { status: 400 });
        }

        console.log(`[API] Tool call result:`, toolResult);

        // Send the result back to the model
        const result2 = await chat.sendMessage([
            {
                functionResponse: {
                    name: call.name,
                    response: toolResult,
                },
            },
        ]);

        const finalResponse = result2.response.text();
        console.log('Final response from Gemini:', finalResponse);
        return NextResponse.json({ response: finalResponse });

    } else {
        // If the model doesn't need to call a tool, just return its response
        const finalResponse = result.response.text();
        console.log('Final response from Gemini (no tool call):', finalResponse);
        return NextResponse.json({ response: finalResponse });
    }
}