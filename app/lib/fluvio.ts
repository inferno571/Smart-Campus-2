import { Fluvio, type TopicProducer } from "@fluvio/client"
import { env } from "./env"

// Cache for Fluvio client and producers
let fluvioClient: Fluvio | null = null
const producers: Map<string, TopicProducer> = new Map()

// Initialize Fluvio client
export async function getFluvioClient(): Promise<Fluvio> {
  if (fluvioClient) return fluvioClient

  try {
    console.log("Initializing Fluvio client...")

    // Create Fluvio client with the provided token
    fluvioClient = new Fluvio({
      endpoint: env.FLUVIO_ENDPOINT,
      authToken: env.FLUVIO_TOKEN,
    })

    // Connect to Fluvio
    await fluvioClient.connect()
    console.log("Connected to Fluvio")

    return fluvioClient
  } catch (error) {
    console.error("Error initializing Fluvio client:", error)
    fluvioClient = null
    throw error
  }
}

// Get or create a producer for a topic
export async function getTopicProducer(topic: string): Promise<TopicProducer> {
  if (producers.has(topic)) {
    return producers.get(topic)!
  }

  try {
    const client = await getFluvioClient()

    // Check if topic exists, create if it doesn't
    const admin = await client.admin()
    const topics = await admin.listTopics()

    if (!topics.includes(topic)) {
      console.log(`Creating topic: ${topic}`)
      await admin.createTopic(topic)
    }

    // Create producer
    const producer = await client.topicProducer(topic)
    producers.set(topic, producer)

    return producer
  } catch (error) {
    console.error(`Error getting producer for topic ${topic}:`, error)
    throw error
  }
}

// Publish a message to a topic
export async function publishToTopic(topic: string, message: any): Promise<void> {
  try {
    const producer = await getTopicProducer(topic)

    // Convert to JSON string if not already a string
    const messageStr = typeof message === "string" ? message : JSON.stringify(message)

    // Send to Fluvio
    await producer.sendRecord(messageStr)
    console.log(`Message published to ${topic}:`, message)
  } catch (error) {
    console.error(`Error publishing to ${topic}:`, error)
    throw error
  }
}

// Subscribe to a topic and get the latest messages
export async function getLatestMessages(topic: string, count = 10): Promise<any[]> {
  try {
    const client = await getFluvioClient()

    // Create consumer
    const consumer = await client.partitionConsumer(topic, 0)

    // Get the latest offset
    const offset = await consumer.queryWatermarks()
    const startOffset = Math.max(0, offset.highWatermark - count)

    // Fetch records
    const records = await consumer.fetch(startOffset, count)

    // Parse records
    return records.records
      .map((record) => {
        try {
          return JSON.parse(record.valueString())
        } catch (e) {
          console.error("Error parsing record:", e)
          return null
        }
      })
      .filter(Boolean)
  } catch (error) {
    console.error(`Error getting latest messages from ${topic}:`, error)
    throw error
  }
}
