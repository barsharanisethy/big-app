const userModel = require('../models/user.model')
const foodPartnerModel = require('../models/foodpartner.model')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User Registration Controller
async function registerUser(req, res) {
    try {
        const { fullName, email, password } = req.body;
        
        if (!fullName || !email || !password) {
            return res.status(400).json({
                message: 'All fields are required'
            });
        }

        const isUserAlreadyExist = await userModel.findOne({ email });
        if (isUserAlreadyExist) {
            return res.status(400).json({
                message: 'User already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            fullName,
            email,
            password: hashedPassword
        });

        const token = jwt.sign(
            {
                userId: user._id,
            },
            process.env.JWT_SECRET
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            message: 'Registration failed. Please try again.'
        });
    }


    }



// User Login Controller
async function loginUser(req, res) {
    try {
        const { email, password } = req.body;
        // basic logging for debugging (do NOT keep password logs in production)
        console.log('Login attempt for:', { email });
        console.log('Request origin:', req.headers && req.headers.origin);
        console.log('Content-Type:', req.headers && req.headers['content-type']);
        try {
            const bodyKeys = req.body ? Object.keys(req.body) : [];
            console.log('Body keys:', bodyKeys, 'passwordLength:', password ? password.length : 0);
        } catch (e) {
            console.log('Error reading body for log:', e && e.message);
        }
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        res.status(200).json({
            message: 'User logged in successfully',
            user: { id: user._id, fullName: user.fullName, email: user.email }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed. Please try again.' });
    }
}


function logoutUser(req,res){
    res.clearCookie('token');
    res.status(200).json({
        message:'User logged out successfully'
    })


}


async function registerFoodPartner(req,res){
    const { name, email, password, phone, address, contactName } = req.body;

    const isAccountAlreadyExists=await foodPartnerModel.findOne({
        email
    })
    if(isAccountAlreadyExists){
        return res.status(400).json({

            message: 'Account already exists'
        })
    }
    const hashedPassword=await bcrypt.hash(password,10);
    const foodPartner=await foodPartnerModel.create({
        name,
        email,
        password:hashedPassword,
        phone,
        address,
        contactName
    })
    const token=jwt.sign(
        {
            foodPartnerId:foodPartner._id,
        },process.env.JWT_SECRET
    )
    res.cookie('token',token,)
    res.status(201).json({
        message: 'Food Partner registered successfully',
        foodPartner:{
            id:foodPartner._id,
            name:foodPartner.name,
            email:foodPartner.email,
            phone:foodPartner.phone,
            address:foodPartner.address,
            contactName:foodPartner.contactName






        }
    })
    
}
    async function loginFoodPartner(req,res){
        const { email, password } = req.body;
        const foodPartner=await foodPartnerModel.findOne({
            email
        })
        if(!foodPartner){
            return res.status(400).json({
                message: 'Invalid email or password'
            })
        }
        const isPasswordValid=await bcrypt.compare(password,foodPartner.password);
        if(!isPasswordValid){
            return res.status(400).json({
                message: 'Invalid email or password'
            })
        }
        const token=jwt.sign(
            {
                foodPartnerId:foodPartner._id,
            },process.env.JWT_SECRET
        )
        res.cookie('token',token,)
        res.status(200).json({
            message: 'Food Partner logged in successfully',
            foodPartner:{
                id:foodPartner._id,

                name:foodPartner.name,
                email:foodPartner.email
            }
        })
    }





async function logoutFoodPartner(req,res){
    res.clearCookie('token');
    res.status(200).json({

        message:'Food Partner logged out successfully'
    })
}



module.exports={registerUser,
    loginUser,
    logoutUser,
    registerFoodPartner,
    loginFoodPartner,
    logoutFoodPartner

};