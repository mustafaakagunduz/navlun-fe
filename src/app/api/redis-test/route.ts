import redis from '@/lib/redis';
import { NextResponse } from 'next/server';

/**
 * Redis Connection Test API
 * GET /api/redis-test
 */
export async function GET() {
  try {
    // Test 1: Ping
    const testKey = 'test:connection:' + Date.now();
    const testValue = 'Hello from Next.js!';

    // Test 2: Set value
    await redis.set(testKey, testValue);
    console.log('✅ Redis SET successful:', testKey);

    // Test 3: Get value
    const retrievedValue = await redis.get(testKey);
    console.log('✅ Redis GET successful:', retrievedValue);

    // Test 4: Delete value
    await redis.del(testKey);
    console.log('✅ Redis DEL successful');

    // Test 5: Increment (for rate limiting)
    const counterKey = 'test:counter';
    const count = await redis.incr(counterKey);
    console.log('✅ Redis INCR successful:', count);

    // Cleanup
    await redis.del(counterKey);

    return NextResponse.json({
      success: true,
      message: 'Redis connection successful! ✅',
      tests: {
        set: 'passed',
        get: 'passed',
        delete: 'passed',
        increment: 'passed',
      },
      testData: {
        key: testKey,
        setValue: testValue,
        retrievedValue: retrievedValue,
        counterValue: count,
      },
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error('❌ Redis connection failed:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Redis connection failed',
        error: error.message || 'Unknown error',
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}
