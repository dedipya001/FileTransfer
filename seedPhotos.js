const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Location = require('./models/Location');
const Photo = require('./models/Photo');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Sample location data (from ElectoralMap.jsx)
const locationData = [
  {
    id: 1,
    name: "Kanaka Durga Temple",
    category: "religious",
    description: "Famous temple dedicated to Goddess Durga located on Indrakeeladri hill.",
    latitude: 16.5175,
    longitude: 80.6096,
    mainImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Sri_Durga_Malleswara_Swamy_Varla_Devasthanam.jpg/320px-Sri_Durga_Malleswara_Swamy_Varla_Devasthanam.jpg"
  },
  {
    id: 2,
    name: "Prakasam Barrage",
    category: "infrastructure",
    description: "Major dam across Krishna River connecting Vijayawada with Guntur district.",
    latitude: 16.5061,
    longitude: 80.6080,
    mainImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Prakasam_Barrage_evening.jpg/320px-Prakasam_Barrage_evening.jpg"
  },
  {
    id: 3,
    name: "Vijayawada Railway Station",
    category: "transport",
    description: "One of the busiest railway stations in India with over 1.4 million passengers daily.",
    latitude: 16.5175,
    longitude: 80.6236,
    mainImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Vijayawada_Junction_railway_station_board.jpg/320px-Vijayawada_Junction_railway_station_board.jpg"
  },

  {
    id: 4,
    name: "Rajiv Gandhi Park",
    category: "recreation",
    description: "Major urban park in the heart of the city with lush greenery.",
    latitude: 16.5009,
    longitude: 80.6525,
    mainImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Rajiv_Gandhi_Park%2C_Vijayawada.jpg/320px-Rajiv_Gandhi_Park%2C_Vijayawada.jpg"
  },
  {
    id: 5,
    name: "Mangalagiri Market Area",
    category: "market",
    description: "A bustling market area known for textiles, fresh produce, spices, and local handicrafts.",
    latitude: 16.4300,
    longitude: 80.5580,
    mainImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/MG_Road%2C_Vijayawada.jpg/320px-MG_Road%2C_Vijayawada.jpg"
  },
  {
    id: 6,
    name: "SRM University, AP",
    category: "educational",
    description: "A prominent private university offering undergraduate, postgraduate, and doctoral programs.",
    latitude: 16.4807,
    longitude: 80.5010,
    mainImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/SRM_University%2C_Andhra_Pradesh.jpg/320px-SRM_University%2C_Andhra_Pradesh.jpg"
  }
];

// Function to create upload directories if they don't exist
const createUploadDirs = () => {
  const uploadDir = path.join(__dirname, 'uploads/locationPhotos');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
};

// Function to get images from dataset folders
const getSourceImages = (locationId) => {
  try {
    // This will look for images in the dataset_yolov8/train/images directory
    // You can adjust the path based on your actual structure
    const sourcePath = path.join(__dirname, 'dataset_yolov8/train/images');
    
    if (!fs.existsSync(sourcePath)) {
      console.error(`Source directory ${sourcePath} does not exist`);
      return [];
    }
    
    const files = fs.readdirSync(sourcePath);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png)$/i.test(file)
    );
    
    return imageFiles.map(file => path.join(sourcePath, file));
  } catch (error) {
    console.error(`Error getting source images for location ${locationId}:`, error);
    return [];
  }
};

// Function to generate photo data for a specific location
const generatePhotosForLocation = async (location, month, year) => {
  const locationId = location.id;
  const photos = [];
  const sourceImages = getSourceImages(locationId);
  
  if (sourceImages.length === 0) {
    console.error(`No source images found for location ${locationId}`);
    return photos;
  }
  
  // Define the output directory
  const outputDir = path.join(__dirname, 'uploads/locationPhotos');
  
  // Get the number of days in the specified month
  const daysInMonth = new Date(year, month, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    // Create 5 photos for each day
    for (let photoNum = 1; photoNum <= 5; photoNum++) {
      try {
        // Select a random source image
        const randomImageIndex = Math.floor(Math.random() * sourceImages.length);
        const sourceImage = sourceImages[randomImageIndex];
        
        // Generate a unique filename
        const captureDate = new Date(year, month - 1, day);
        const dateStr = captureDate.toISOString().split('T')[0];
        const uniqueId = uuidv4().substring(0, 8);
        const fileName = `location_${locationId}_${dateStr}_${photoNum}_${uniqueId}.jpg`;
        const outputPath = path.join(outputDir, fileName);
        
        // Process image with sharp
        await sharp(sourceImage)
          .resize(800, 600, { fit: 'cover' })
          .jpeg({ quality: 80 })
          .toFile(outputPath);
        
        // Create photo document
        const photo = new Photo({
          locationId,
          captureDate,
          filePath: `/uploads/locationPhotos/${fileName}`,
          fileName,
          caption: `${location.name} - Day ${day}, Photo ${photoNum}`,
          metadata: {
            width: 800,
            height: 600,
            size: fs.statSync(outputPath).size
          },
          stats: {
            peopleCount: Math.floor(Math.random() * 20), // Random stats for demo
            vehicleCount: Math.floor(Math.random() * 10),
            garbageLevel: ['low', 'medium', 'high', 'none'][Math.floor(Math.random() * 4)],
            weatherCondition: ['sunny', 'cloudy', 'rainy', 'foggy', 'unknown'][Math.floor(Math.random() * 5)]
          }
        });
        
        photos.push(photo);
      } catch (error) {
        console.error(`Error processing image ${photoNum} for location ${locationId} on day ${day}:`, error);
      }
    }
  }
  
  return photos;
};

// Main function to seed the database
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    console.log('Creating upload directories...');
    createUploadDirs();
    
    // Clear existing data
    await Location.deleteMany({});
    await Photo.deleteMany({});
    
    console.log('Existing data cleared. Seeding new data...');
    
    // Insert locations
    await Location.insertMany(locationData);
    console.log(`✅ Inserted ${locationData.length} locations`);
    
    // Set month and year for the photos
    const month = 4; // April
    const year = 2025;
    
    // Generate and insert photos for each location
    for (const location of locationData) {
      console.log(`Generating photos for location: ${location.name} (ID: ${location.id})`);
      const photos = await generatePhotosForLocation(location, month, year);
      
      if (photos.length > 0) {
        await Photo.insertMany(photos);
        console.log(`✅ Added ${photos.length} photos for location: ${location.name}`);
      }
    }
    
    console.log('Database seeding completed successfully 🎉');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seeding function
seedDatabase();
