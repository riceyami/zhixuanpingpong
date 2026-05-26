// 智旋 (Zhuxuan) MongoDB 初始化脚本
db = db.getSiblingDB('zhuxuan');

// 1. 分析结果集合 (analysis_result)
db.createCollection('analysis_result');
db.analysis_result.createIndex({ "video_id": 1 }, { unique: true });

print('MongoDB collections and indexes initialized.');
