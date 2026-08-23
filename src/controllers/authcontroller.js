const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await user.findOne({ email });
        if (existingUser) {
            return res
                .status(400)
                .json({ success: false, message: 'User already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const allowedRoles = ['user', 'restaurant', 'deliveryPartner'];
        const assignedRole = allowedRoles.includes(role) ? role : 'user';

        const User = await user.create({
            name,
            email,
            password: hashedPassword,
            role: assignedRole
        });
        return res
            .status(201)
            .json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        
        const User = await user.findOne({ email }).select('+password');
        if (!User) {
            return res
                .status(400)
                .json({ success: false, message: 'Invalid credentials' });
        }

        
        if (User.isblocked) {
            return res
                .status(403)
                .json({ success: false, message: 'User is blocked' });
        }
        if (User.isRestricted) {
            return res
                .status(403)
                .json({ success: false, message: 'Account restricted due to security flags.' });
        }

        
        const isMatch = await bcrypt.compare(password, User.password);
        if (!isMatch) {
            return res
                .status(400)
                .json({ success: false, message: 'Invalid credentials' });
        }

        
        const token = jwt.sign(
            { id: User._id, role: User.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
        );

        return res.status(200).json({ 
            success: true, 
            message: 'Login successful', 
            token,
            user: {
                id: User._id,
                name: User.name,
                email: User.email,
                role: User.role
            }
        });
    }
    catch (error) {
        return res
            .status(500)
            .json({ success: false, message: 'Server error', error: error.message });
    }       
};



    
