import { connection } from "../database/Database.js";

const usuarioRepository = {
    create: async (usuario) => {
        const sql = 'INSERT INTO usuarios (username, password) VALUES (?, ?)';
       
        const values = [usuario.username, usuario.hashedPassword];

        const [rows] = await connection.execute(sql, values);

        return rows;
    },
    findByUserName: async (username) => {
        const sql = "SELECT * FROM usuarios WHERE username = ?;";

        const values = [username];

        const [rows] = await connection.execute(sql, values);

        return rows[0];
    },
    getAllUsers: async () => {
        const sql = "SELECT * FROM usuarios;";

        const [rows] = await connection.execute(sql);

        return rows;
    }
}

export default usuarioRepository;