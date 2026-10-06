import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import usuarioRepository from '../repositories/usuarioRepository.js';
import 'dotenv/config';

const authController = {
    criar: async (req, res) => {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({
                    message: 'Informe corretamente usuário e senha!'
                })
            }

            const userExist = await usuarioRepository.findByUserName(
                username.trim()
            );

            if (userExist)
                return res.status(400).json({
                    message: 'Usuário já existe!!!'
                })

                const hashedPassword = await bcrypt.hash(password, 10);

                const userId = await usuarioRepository.create({username, hashedPassword});

                res.status(201).json({message: 'Usuário criado com sucesso!'})

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: 'Ocorreu um erro no servidor',
                errorMessage: error.massage
            })
        }
    },
    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            const userExists = await usuarioRepository.findByUserName(
                username.trim()
            )

            if(!userExists)
                return res.status(401).json({ message: 'Usuário não encontrado' })

            const validPassword = await bcrypt.compare(password, userExists.password);

            if(!validPassword)
                return res.status(401).json({
                    message: "Senha inválida!!"
                })

            const accessToken = jwt.sign(
                {
                    id: userExists.id,
                    username: userExists.username
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: '3m'
                }
            )

            res.status(200).json({ 
                message: 'Login realizado com sucesso!',
                token: accessToken
             })
            
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: 'Ocorreu um erro no servidor',
                errorMessage: error.message
            })
        }
    },

    users: async (req, res) => {
        try {
            const result = await usuarioRepository.getAllUsers();
        res.status(200).json({ message: "sucesso", users: result })
        
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: 'Ocorreu um erro no servidor',
                errorMessage: error.message
            })
            
        }
    }
}

export default authController;