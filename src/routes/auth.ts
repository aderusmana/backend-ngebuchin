import  bcrypt from 'bcryptjs';
import express, { Request, Response } from "express";
import User from "../models/user";
import jwt from "jsonwebtoken";
import Joi from "joi";
import verifyToken from '../middleware/auth';

const router = express.Router();

// Register
const registrationValidate = Joi.object({
  email: Joi.string().email().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  password: Joi.string().min(5).required(),
}).options({ abortEarly: false });

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { error, value } = registrationValidate.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: error.details.map((detail) => detail.message) });
    }
    let user = await User.findOne({
      email: value.email,
    });
    if (user) {
      res.status(400).json({ message: "User already exists" });
    }
    user = new User(value);
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d",
      }
    );
    res.cookie("auth_token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 1000 * 60 * 60 * 24,
    });
    res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Something went wrong" });
  }
});


// Login
const loginValidate = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(5).required(),
})

router.post("/login",async (req: Request, res: Response) => {
  try {
    const {error, value} = loginValidate.validate(req.body);
    if(error){
      return res
        .status(400)
        .json({ message: error.details.map((detail) => detail.message) });
    }
    const user = await User.findOne({
      email: value.email
    })
    if(!user){
      return res.status(400).json({message: "User not found or Invalid Credentials"})
    }
    
    const token = jwt.sign(
      {userId: user._id},
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    )

    res.cookie("auth_token", token ,{
      httpOnly:true,
      sameSite: "none",
      secure : true,
      maxAge: 1000 * 60 * 60 * 24
    })

    res.status(200).json({ userId: user._id,message: "Login Successful"})
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
})

router.get("/validate-token", verifyToken, (req: Request, res: Response) => {
  res.status(200).send({userId: req.userId});
})

router.post("/logout", (req: Request, res: Response) => {
  
  res.clearCookie("auth_token");

  res.status(200).json({ message: "Logout Successful" });
})


export default router;
