export default function reportExpiredPendingEvent(call, callback) {
    const topic = call.request.topic;
    const count = call.request.count;
    const options = call.request.options;

    console.log(`[gRPC-MongoDB-Cache-Server] ExpiredPendingEventService.reportExpiredPendingEvent received`);
    console.log(`  Topic: ${topic}`);
    console.log(`  Count: ${count}`);
    console.log(`  Options:`, options); 

    // TODO: MongoDB Service code here

    const response = {
        success: true,
        message: `Pending event { topic: ${topic}, count: ${count}, optons: ${JSON.stringify(options)} }`
    };

    console.log(`[gRPC-MongoDB-Cache-Server] ExpiredPendingEventService.reportExpiredPendingEvent response:`);
    console.log(`  Message: ${response.message}`);
    console.log(`  Success: ${response.success}`);

    callback(null, response);
}