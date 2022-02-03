const express = require('express');
const router = express.Router();
const { config } = require('../config');
const db = require('../database/db');
const { param, query, body } = require('express-validator');
const fs = require('fs');
const path = require('path');
const jschardet = require('jschardet');
const { getTrackList } = require('../filesystem/utils');
const { joinFragments } = require('./utils/url')
const { isValidRequest } = require('./utils/validate')


// 历史记录插入和获取的简单实现
// Post add a play history
router.put('/', 
  body('work_id').isInt(),
  body('file_index').isInt(),
  body('file_name').isString(),
  body('play_time'),
  body('total_time'),
  (req, res, next) => {
    if(!isValidRequest(req, res)) return;

    console.log("hello world")
    // 插入历史记录
    const username = config.auth ? req.user.name : 'admin';

    db.insertHistory(username, req.body.work_id, req.body.file_index, req.body.file_name, req.body.play_time, req.body.total_time)
    .then(() => {
      res.send({ message: '历史记录添加成功' });
    }).catch((err) =>{
      res.status(500).send({ error: '添加失败，服务器错误' });
      console.error(err);
    })
  }  
)


// 读取历史记录
// 同一个 id 最后一次的数据即可
router.get('/', 
  async (req, res, next) => {
    if(!isValidRequest(req, res)) return;

    const username = config.auth ? req.user.name : 'admin';

    try {
      history = await db.getHistoryByUsername(username)

      history.map(record => {
        record.work_id = parseInt(record.work_id);
        record.file_index = parseInt(record.file_index);
        record.file_name = record.file_name;
        record.play_time = record.play_time;
        record.total_time = record.total_time;
        record.updated_at = record.updated_at;
        record.user_name = record.username;
      })

      res.send(history)
    } catch(err) {
      console.log(err)
      res.status(500).send({ error: '服务器错误' });
    }
  }
)

router.get('/getByWorkIdIndex', 
  query('work_id'),
  query('file_index'),
  async (req, res, next) => {
    if(!isValidRequest(req, res)) return;

    const username = config.auth ? req.user.name : 'admin';

    try {
      history = await db.getHistoryByWorkIdIndex(username, req.query.work_id, req.query.file_index)

      history.map(record => {
        record.work_id = parseInt(record.work_id);
        record.file_index = parseInt(record.file_index);
        record.file_name = record.file_name;
        record.play_time = record.play_time;
        record.total_time = record.total_time;
        record.updated_at = record.updated_at;
        record.user_name = record.username;
      })

      res.send(history)
    } catch(err) {
      console.log(err)
      res.status(500).send({ error: '服务器错误' });
    }

  }
)

module.exports = router;