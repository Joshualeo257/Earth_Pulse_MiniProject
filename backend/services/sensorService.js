const { Sensor, SensorReading } = require('../models/Sensor');

/**
 * Generates a random number within a given range.
 * @param {number} min - The minimum value.
 * @param {number} max - The maximum value.
 * @returns {number} A random number.
 */
const getRandom = (min, max, decimals = 2) => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
};

/**
 * Generates simulated sensor data for all active sensors.
 * This is used by a cron job for demo purposes.
 */
const generateSensorData = async () => {
  console.log('Generating new sensor data...');
  try {
    const activeSensors = await Sensor.find({ status: 'Active' });

    if (activeSensors.length === 0) {
      console.log('No active sensors found to generate data for.');
      return;
    }

    const readingPromises = activeSensors.map(sensor => {
      const readings = {
        soilMoisture: getRandom(15, 85),
        temperature: getRandom(18, 32),
        humidity: getRandom(40, 90),
        pH: getRandom(6.0, 7.5)
      };
      
      const newReading = new SensorReading({
        sensorId: sensor._id,
        readings: readings
      });

      // Update the sensor's last reading time
      sensor.lastReading = new Date();
      sensor.batteryLevel = Math.max(0, sensor.batteryLevel - getRandom(0.01, 0.05)); // Simulate battery drain

      return Promise.all([newReading.save(), sensor.save()]);
    });

    await Promise.all(readingPromises);
    console.log(`Generated and saved new readings for ${activeSensors.length} sensors.`);
  } catch (error) {
    console.error('Error in generateSensorData service:', error);
  }
};

module.exports = {
  generateSensorData
};