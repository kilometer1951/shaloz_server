// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const conversationSchema = new Schema({
//     created: { type: Date, default:Date.now },
// 	from: { type: Schema.Types.ObjectId, ref: 'users' },
// 	to: { type: Schema.Types.ObjectId, ref: 'users' },
// 	messages: { type: Schema.Types.ObjectId, ref: 'messages' },
// 	room:{type:String, default:""},
// 	message_preview:{type:String, default:""},
// 	user_has_viewed:{ type: Boolean, default: true },
// 	seller_has_viewed:{ type: Boolean, default: true },
// });

// module.exports = mongoose.model('conversations', conversationSchema);