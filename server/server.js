require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Asset = require('./models/Asset'); // Import model vừa tạo

const app = express();

// Middleware
app.use(cors()); // Cho phép Frontend (React/HTML) gọi vào
app.use(express.json()); // Cho phép đọc dữ liệu JSON gửi lên

// 1. Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Đã kết nối MongoDB thành công'))
  .catch((err) => console.error('Lỗi kết nối MongoDB:', err));

// --- CÁC API (ROUTES) ---

// API 1: Lấy danh sách tất cả NFT đang bán (Marketplace)
// GET http://localhost:5000/api/assets/market
app.get('/api/assets/market', async (req, res) => {
  try {
    // Chỉ lấy những cái đang được rao bán (isListed = true)
    const assets = await Asset.find({ isListed: true });
    res.json(assets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 2: Lấy danh sách NFT của một user cụ thể (My Assets)
// GET http://localhost:5000/api/assets/user/:address
app.get('/api/assets/user/:address', async (req, res) => {
  try {
    const assets = await Asset.find({ ownerAddress: req.params.address.toLowerCase() });
    res.json(assets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 3: Thêm mới NFT (Gọi sau khi Mint thành công trên Blockchain)
// POST http://localhost:5000/api/assets
app.post('/api/assets', async (req, res) => {
  try {
    const { tokenId, name, description, imageUrl, ownerAddress } = req.body;
    
    // Kiểm tra xem đã tồn tại chưa
    const exists = await Asset.findOne({ tokenId });
    if (exists) return res.status(400).json({ message: "Token ID đã tồn tại" });

    const newAsset = new Asset({
      tokenId,
      name,
      description,
      imageUrl,
      ownerAddress: ownerAddress.toLowerCase(),
      isListed: false,
      price: 0
    });

    await newAsset.save();
    res.status(201).json({ message: "Đã lưu NFT vào database", asset: newAsset });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 4: Cập nhật trạng thái (Đăng bán / Mua thành công)
// PUT http://localhost:5000/api/assets/:tokenId
app.put('/api/assets/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const { price, isListed, ownerAddress } = req.body; // Những thông tin cần update

    const updatedAsset = await Asset.findOneAndUpdate(
      { tokenId: tokenId },
      { 
        $set: { 
            ...(price !== undefined && { price }), 
            ...(isListed !== undefined && { isListed }),
            ...(ownerAddress && { ownerAddress: ownerAddress.toLowerCase() })
        } 
      },
      { new: true } // Trả về dữ liệu mới sau khi update
    );

    if (!updatedAsset) return res.status(404).json({ message: "Không tìm thấy NFT" });
    
    res.json({ message: "Update thành công", asset: updatedAsset });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Chạy server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server đang chạy tại port ${PORT}`));