export default function reportCreatedBlockEvent(call, callback) {
    const topic = call.request.topic;
    const height = call.request.height;

    console.log(`[gRPC-MongoDB-Cache-Server] CreatedBlockEventService.reportCreatedBlockEvent received`);
    console.log(`  Topic: ${topic}`);
    console.log(`  Height: ${height}`);

    // TODO: MongoDB Service code here

    const response = {
        success: true,
        message: `Block event { topic: ${topic}, height: ${height} }`
    };

    console.log(`[gRPC-MongoDB-Cache-Server] CreatedBlockEventService.reportCreatedBlockEvent response:`);
    console.log(`  Message: ${response.message}`);
    console.log(`  Success: ${response.success}`);

    callback(null, response);
}