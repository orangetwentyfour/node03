const Constants = require('../common/constants');
const { ResponseSuccess } = require('../helpers/response.helper');
const { roomRepository, messageRepository } = require('../repositories');
const _ = require('lodash');

const create =  async function(req, res, next = function(err) {
    return Promise.reject(err);
}) {
    try {
        const author = req.user._id;
        const data = req.body;
        // pick/omit cua lodash
        
        const existedRoom = await roomRepository.getOne({
            author,
            where: {
                _id: data.room,
                members: author
            }
        });

        if (!existedRoom) {
            return next(new Error('NOT_EXISTED_ROOM'));
        }
        data.author = author;
        const message = await messageRepository.create(data);

        await roomRepository.updateOne({
            where: { 
                _id: data.room 
            }, 
            data: {
                lastMessage: message._id
            }
        });
        return ResponseSuccess('CREATE_MESSAGE_SUCCESS', {
            content: message.content,
            author: message.author,
            createdAt: message.createdAt,
            room: message.room
        }, res);
    } catch (error) {
        return next(error);
    }
};

const getById = async function(req, res, next = function(err) {
    return Promise.reject(err);
}) {
    try {
        const { id } = req.params;
        const author = req.user._id;
        const message = await messageRepository.getOne({
            where: {
                _id: id,
                author: author
            },
            populate: [
                {
                    path: 'author',
                    select: '_id username'
                }
            ]
        });
        if (!message) {
            return next(new Error('NOT_EXISTED_MESSAGE'));
        }

        return ResponseSuccess('GET_MESSAGE_SUCCESS', message, res);
    } catch (error) {
        return next(error);
    }
};

const update = async function(req, res, next = function(err) {
    return Promise.reject(err);
}) {
    try {
        const { id } = req.params;
        const author = req.user._id;
        const {
            content,
        } = req.body;

        const message = await messageRepository.getOneAndUpdate({
            where: { 
                _id: id,
                author: author
            },
            data: {
                content
            }
        });

        if (!message) {
            return next(new Error('NOT_EXISTED_MESSAGE'));
        }

        return ResponseSuccess('UPDATE_MESSAGE_SUCCESS', message, res);
    } catch (error) {
        return next(error);
    }
};

const deleteById = async function(req, res, next = function(err) {
    return Promise.reject(err);
}) {
    try {
        const { id } = req.params;
        const author = req.user._id;
        const message = await messageRepository.deleteOne({ 
            _id: id,
            author: author
        });
        
        if (message.n === 0) {
            return next(new Error('NOT_EXISTED_MESSAGE'));
        }

        return ResponseSuccess('DELETE_MESSAGE_SUCCESS', message, res);
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    create,
    getById,
    update,
    deleteById
};
