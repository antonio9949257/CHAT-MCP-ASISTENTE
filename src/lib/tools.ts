import os from 'os';

// This file simulates our MCP (Model-Client-Proxy) server.
// In a real-world scenario, this would be a separate service that accesses a database or other APIs.

const productDatabase: { [key: string]: any } = {
    "laptop-01": { name: "SuperFast Laptop", price: 1200, stock: 15 },
    "mouse-02": { name: "ErgoComfort Mouse", price: 80, stock: 45 },
    "keyboard-03": { name: "Mechanical Keyboard", price: 150, stock: 20 },
};

// The actual function that gets called when the model requests a tool.
export const getProductInfo = (productId: string) => {
    console.log(`[MCP Server] Fetching info for product: ${productId}`);
    return productDatabase[productId] || { error: "Product not found" };
};

export const addNumbers = (num1: number, num2: number) => {
    console.log(`[MCP Server] Adding numbers: ${num1} + ${num2}`);
    return { sum: num1 + num2 };
};

export const getSystemInfo = (infoType?: string) => {
    console.log(`[MCP Server] Getting system information for type: ${infoType || 'all'}.`);
    const allInfo = {
        platform: os.platform(),
        architecture: os.arch(),
        type: os.type(),
        release: os.release(),
        uptime: os.uptime(), // in seconds
        totalMemory: os.totalmem(), // in bytes
        freeMemory: os.freemem(), // in bytes
        cpus: os.cpus().length, // number of CPU cores
        cpuModel: os.cpus()[0]?.model, // model of the first CPU
        hostname: os.hostname(),
        username: os.userInfo().username, // Moved from getSystemUsername
        networkInterfaces: os.networkInterfaces(),
    };

    if (infoType && allInfo.hasOwnProperty(infoType)) {
        return { [infoType]: (allInfo as any)[infoType] };
    } else if (infoType) {
        return { error: `Información de tipo '${infoType}' no encontrada.` };
    } else {
        return allInfo;
    }
};

export const getCurrentTime = () => {
    console.log(`[MCP Server] Getting current system time.`);
    const now = new Date();
    return { time: now.toLocaleTimeString(), date: now.toLocaleDateString() };
};

// getSystemUsername is now integrated into getSystemInfo, so we can remove it
// export const getSystemUsername = () => {
//     console.log(`[MCP Server] Getting system username.`);
//     return { username: os.userInfo().username };
// };