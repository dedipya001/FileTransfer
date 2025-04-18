const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://dedipyagoswami001:6Ry2mqBqFYru2Eta@cluster0.84udc0z.mongodb.net/vijayawada_map', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('MongoDB connection error:', err));

// Define schemas
const LocationSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: String,
  latitude: Number,
  longitude: Number,
  mainImage: String
});

const PhotoSchema = new mongoose.Schema({
  locationId: {
    type: Number,
    required: true,
    ref: 'Location'
  },
  date: {
    type: Date,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  caption: String,
  metadata: {
    width: Number,
    height: Number,
    size: Number,
    format: String
  },
  tags: [String],
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

// Create indexes for frequent queries
PhotoSchema.index({ locationId: 1, date: 1 });

const Location = mongoose.model('Location', LocationSchema);
const Photo = mongoose.model('Photo', PhotoSchema);

// The landmark data from your ElectoralMap.jsx
const locations = [
  {
    id: 1,
    name: "Kanaka Durga Temple",
    category: "religious",
    description: "Famous temple dedicated to Goddess Durga located on Indrakeeladri hill. One of the most important religious sites in Andhra Pradesh.",
    latitude: 16.5175,
    longitude: 80.6096,
    mainImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Sri_Durga_Malleswara_Swamy_Varla_Devasthanam.jpg/320px-Sri_Durga_Malleswara_Swamy_Varla_Devasthanam.jpg"
  },
  {
    id: 2,
    name: "Prakasam Barrage",
    category: "infrastructure",
    description: "Major dam across Krishna River connecting Vijayawada with Guntur district. Built in 1957, it serves irrigation needs and is a popular tourist spot.",
    latitude: 16.5061,
    longitude: 80.6080,
    mainImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Prakasam_Barrage_evening.jpg/320px-Prakasam_Barrage_evening.jpg"
  },
  {
    id: 3,
    name: "Vijayawada Railway Station",
    category: "transport",
    description: "One of the busiest railway stations in India with over 1.4 million passengers daily. A key junction connecting North and South India.",
    latitude: 16.5175,
    longitude: 80.6236,
    mainImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Vijayawada_Junction_railway_station_board.jpg/320px-Vijayawada_Junction_railway_station_board.jpg"
  },
  {
    id: 4,
    name: "Rajiv Gandhi Park",
    category: "recreation",
    description: "Major urban park in the heart of the city with lush greenery, walking paths, and recreational facilities for families.",
    latitude: 16.5009,
    longitude: 80.6525,
    mainImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Rajiv_Gandhi_Park%2C_Vijayawada.jpg/320px-Rajiv_Gandhi_Park%2C_Vijayawada.jpg"
  },
  {
    id: 5,
    name: "Mangalagiri Market Area",
    category: "market",
    description: "A bustling market area known for textiles, fresh produce, spices, and local handicrafts. Popular among locals and tourists alike.",
    latitude: 16.4300,
    longitude: 80.5580,
    mainImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/MG_Road%2C_Vijayawada.jpg/320px-MG_Road%2C_Vijayawada.jpg"
  },
  {
    id: 6,
    name: "SRM University, AP",
    category: "educational",
    description: "A prominent private university offering undergraduate, postgraduate, and doctoral programs in engineering, sciences, liberal arts, and management.",
    latitude: 16.4807,
    longitude: 80.5010,
    mainImage: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/SRM_University%2C_Andhra_Pradesh.jpg/320px-SRM_University%2C_Andhra_Pradesh.jpg"
  }
];

// Function to generate photo data for a location
async function generatePhotosForLocation(location) {
  console.log(`Generating photos for ${location.name}...`);
  const photos = [];
  
  // Path to the dataset directory for images
  const datasetPath = path.join(__dirname, 'dataset_yolov8', 'train', 'images');
  
  try {
    // Check if directory exists
    if (!fs.existsSync(datasetPath)) {
      console.error(`Dataset path ${datasetPath} does not exist`);
      return photos;
    }
    
    // Get all image files from the dataset
    const imageFiles = fs.readdirSync(datasetPath)
      .filter(file => /\.(jpe?g|png)$/i.test(file));
    
    if (imageFiles.length === 0) {
      console.error(`No image files found in ${datasetPath}`);
      return photos;
    }
    
    console.log(`Found ${imageFiles.length} images in dataset`);
    
    // Create uploads directory for location if it doesn't exist
    const uploadDir = path.join(__dirname, 'uploads', 'locationPhotos', location.id.toString());
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Generate 5 photos per day for 30 days (April 2025)
    for (let day = 1; day <= 30; day++) {
      for (let photoNum = 1; photoNum <= 5; photoNum++) {
        // Get a random image from the dataset
        const randomIndex = Math.floor(Math.random() * imageFiles.length);
        const sourceImage = path.join(datasetPath, imageFiles[randomIndex]);
        
        // Create a unique filename
        const date = new Date(2025, 3, day); // April 2025 (month is 0-indexed)
        const filename = `location_${location.id}_${date.toISOString().split('T')[0]}_${photoNum}.jpg`;
        const targetPath = path.join(uploadDir, filename);
        
        try {
          // Copy the image from dataset to uploads folder
          fs.copyFileSync(sourceImage, targetPath);
          
          // Get file stats
          const fileStats = fs.statSync(targetPath);
          
          // Create relative path for database
          const relativePath = `/uploads/locationPhotos/${location.id}/${filename}`;
          
          photos.push({
            locationId: location.id,
            date,
            path: relativePath, // Store the relative path in the database
            caption: `Photo ${photoNum} at ${location.name} on ${date.toLocaleDateString()}`,
            metadata: {
              width: 800, // Placeholder values - would ideally read from image
              height: 600, // Placeholder values - would ideally read from image
              size: fileStats.size,
              format: 'jpg'
            },
            tags: [location.category, 'vijayawada', `day-${day}`],
            uploadedAt: new Date()
          });
          
          console.log(`  - Created photo: ${filename}`);
        } catch (copyError) {
          console.error(`  - Error copying file ${sourceImage} to ${targetPath}:`, copyError);
        }
      }
    }
    
    return photos;
  } catch (error) {
    console.error(`Error generating photos for ${location.name}:`, error);
    return photos;
  }
}

// Main function to seed the database
async function seedDatabase() {
  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await Location.deleteMany({});
    await Photo.deleteMany({});
    
    // Insert locations
    console.log('Inserting locations...');
    await Location.insertMany(locations);
    console.log(`✅ Added ${locations.length} locations`);
    
    // Generate and insert photos for each location
    for (const location of locations) {
      console.log(`Processing location: ${location.name}`);
      const photos = await generatePhotosForLocation(location);
      
      if (photos.length > 0) {
        await Photo.insertMany(photos);
        console.log(`✅ Added ${photos.length} photos for ${location.name}`);
      } else {
        console.warn(`⚠️ No photos were generated for ${location.name}`);
      }
    }
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.disconnect();
  }
}

// Run the seeding process
seedDatabase();
