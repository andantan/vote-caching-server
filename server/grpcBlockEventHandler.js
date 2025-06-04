export function reportCreatedBlockEvent(call, callback) {
    const topic = call.request.topic;
    const height = call.request.height;

    console.log(`[CreatedBlockEventService] Received Block Event:`);
    console.log(`  Topic: ${topic}`);
    console.log(`  Height: ${height}`);

    // TODO: MongoDB Service code here

    const response = {
        success: true,
        message: `Block event { topic: ${topic}, height: ${height} }`
    };

    callback(null, response)
}