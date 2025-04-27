# Safety Alerts System with Fluvio Integration

This module implements a real-time safety alerts system for the Smart Campus Toolkit. It uses Fluvio for real-time streaming of alerts across the campus.

## Implementation Notes

### Browser Preview vs Production

In the browser preview environment (Next.js Lite), we use a simulated version of the Fluvio client that stores alerts in memory. This allows for testing and development without requiring the actual Fluvio client.

In a production environment, you would:

1. Install the `@fluvio/client` package:
   \`\`\`bash
   npm install @fluvio/client
   \`\`\`

2. Update the `subscribe-to-alerts.ts` file to use the actual Fluvio client:
   \`\`\`typescript
   import { Fluvio } from '@fluvio/client';
   
   // Initialize Fluvio client
   const fluvio = new Fluvio({
     endpoint: env.FLUVIO_ENDPOINT,
     authToken: env.FLUVIO_TOKEN,
   });
   
   // Connect to Fluvio
   await fluvio.connect();
   
   // Create a producer
   const producer = await fluvio.topicProducer('campus-alerts');
   
   // Publish an alert
   await producer.sendRecord(JSON.stringify(alert));
   
   // Subscribe to alerts
   const consumer = await fluvio.partitionConsumer('campus-alerts', 0);
   const records = await consumer.fetch(offset, 10);
   \`\`\`

### Server Actions

All Fluvio-specific code is kept in server actions to ensure it only runs on the server. Client components only call these server actions and don't directly import the Fluvio client.

## Usage

1. Use the `triggerAlert` server action to broadcast a new alert
2. Use the `subscribeToAlerts` server action to get the latest alerts
3. Use the `generateSampleAlert` server action to generate a test alert

## Environment Variables

- `FLUVIO_TOKEN`: Your Fluvio authentication token
- `FLUVIO_ENDPOINT`: The Fluvio endpoint URL (defaults to "https://cloud.infinyon.com")
