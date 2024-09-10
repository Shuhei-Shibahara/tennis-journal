import mongoose from 'mongoose'; // Add this import at the top
import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';

// Register a new user
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    const newUser = new User({ username, email, password });
    const savedUser = await newUser.save();

    res.status(201).json(savedUser);
  } catch (error: unknown) { // Type the error as unknown
    if (error instanceof mongoose.Error.ValidationError) {
      // Handle validation errors from Mongoose
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }

    console.error(error); // Log the error to the console
    res.status(500).json({ message: 'Error registering user', error: (error as Error).message }); // Cast to Error
  }
};

// Login a user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

    // Send the token
    res.json({ token });
  } catch (error) {
    // Simplified error logging and response
    console.error('Error logging in:', error instanceof Error ? error.message : error);
    res.status(500).json({ message: 'Error logging in' });
  }
};