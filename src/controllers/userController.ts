import { NextFunction, Request, Response } from "express";
import { CreateUserDTO } from "../dtos/createUserDTO";
import { User } from "../models/User";
import { LoginDTO } from "../dtos/loginDTO";
import bcrypt from "bcryptjs";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export class UserController {
  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const data: LoginDTO = req.body;

      const user = await User.findOne({ email: data.email });

      if (!user) {
        res.status(404).json({ message: "Usuário não encontrado" });
        return;
      }

      if (!user.password) {
        res
          .status(400)
          .json({ message: "Senha não encontrada para o usuário" });
        return;
      }

      const isPasswordValid = await bcrypt.compare(
        data.password,
        user.password
      );

      if (!isPasswordValid) {
        res.status(401).json({ message: "Senha inválida" });
        return;
      }

      const secret: string = process.env.JWT_SECRET!;
      const expiresIn: number = parseInt(
        process.env.JWT_EXPIRES_IN || "3600",
        10
      );

      if (!secret) {
        res
          .status(500)
          .json({ message: "Chave secreta JWT não configurada corretamente" });
        return;
      }

      const token = jwt.sign({ userId: user._id, email: user.email }, secret, {
        expiresIn,
      });

      res.json({
        message: "Login realizado com sucesso",
        user: { name: user.name, email: user.email },
        token,
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      console.log(data);
      const userDTO = plainToClass(CreateUserDTO, data);

      const errors = await validate(userDTO);
      if (errors.length > 0) {
        const errorMessages = errors.flatMap((error) =>
          error.constraints ? Object.values(error.constraints) : []
        );
        res
          .status(400)
          .json({ message: "Erros de validação", errors: errorMessages });
        return;
      }

      const existingUser = await User.findOne({ email: userDTO.email });
      if (existingUser) {
        res.status(400).json({ message: "Email já cadastrado" });
        return;
      }

      const hashedPassword = await bcrypt.hash(userDTO.password!, 10);

      const newUser = new User({
        name: userDTO.name,
        email: userDTO.email,
        password: hashedPassword,
        birthDate: userDTO.birthDate ? new Date(userDTO.birthDate) : undefined,
        userType: userDTO.userType,
        createdAt: new Date(),
      });

      await newUser.save();

      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ message: "Erro ao criar usuário", error });
    }
  }

  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const users = await User.find();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar usuários", error });
    }
  }

  static async getUser(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;

      const user = await User.findById(id);

      if (!user) {
        res.status(404).json({ message: "Usuário não encontrado" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar usuário", error });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, email, password } = req.body;

      const user = await User.findById(id);

      if (!user) {
        res.status(404).json({ message: "Usuário não encontrado" });
        return;
      }

      if (name) user.name = name;
      if (email) user.email = email;
      if (password) user.password = password;

      await user.save();

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar usuário", error });
    }
  }
}
