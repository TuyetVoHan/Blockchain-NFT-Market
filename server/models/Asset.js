const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
  tokenId: { 
    type: Number, 
    required: true, 
    unique: true 
  }, // ID khớp với trên Blockchain
  name: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String, required: true },
  price: { type: Number, default: 0 }, // Lưu giá ETH
  ownerAddress: { type: String, required: true, lowercase: true }, // Địa chỉ ví người sở hữu
  isListed: { type: Boolean, default: false }, // Đang bán hay không
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Asset', AssetSchema);