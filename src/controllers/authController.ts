import { Request, Response } from "express";
import * as authService from "../services/auth/authService";

export class AuthController {
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ message: "O campo e-mail é obrigatório." });
        return;
      }

      await authService.requestPasswordReset(email);

      res.status(200).json({
        message:
          "Se um usuário com este e-mail existir, um link para redefinição de senha foi enviado.",
      });
    } catch (error) {
      console.error("Erro ao solicitar redefinição de senha:", error);
      res.status(500).json({ message: "Ocorreu um erro interno no servidor." });
    }
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;
      const { password } = req.body;

      if (!password) {
        res.status(400).json({ message: "A nova senha é obrigatória." });
        return;
      }

      await authService.resetPassword(token, password);

      res.status(200).json({ message: "Senha redefinida com sucesso!" });
    } catch (error: any) {
      console.error("Erro ao redefinir senha:", error);
      res.status(400).json({ message: error.message });
    }
  }
}
