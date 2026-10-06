import app from "../src/app.js";

import request from "supertest";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MontadoraFactory } from "./factories/MontadoraFactory.js";

import { ClienteFactory } from "./factories/ClienteFactory.js";

import { clearDatabase } from "./utils/clearDatabase.js";

import axios from "axios";

vi.mock("axios");

describe("API de Montadoras", () => {
  beforeEach(async () => {
    await MontadoraFactory.create("Toyota", "Japão");
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await clearDatabase();
    vi.resetAllMocks();
  });

  it("Deve criar uma nova montadora (POST)", async () => {
    const response = await request(app)
      .post("/montadoras")
      .send({ nome: "Hyundai", pais: "Coreia do Sul" });

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty("insertId");
  });

  it("Deve buscar montadoras no banco de dados (GET)", async () => {
    const response = await request(app).get("/montadoras");

    expect(response.status).toBe(200);
  });

  it("Deve atualizar uma montadora (PUT)", async () => {
    const montadora = await MontadoraFactory.create("Koenigsegg", "Finlandia");
    const response = await request(app)
      .put(`/montadoras?id=${montadora.id}`)
      .send({ nome: "Koenigsegg", pais: "Suécia" });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty("insertId");
  });

  it("Deve deletar uma montadora (DELETE)", async () => {
    const montadora = await MontadoraFactory.create("Volkswagen", "Alemanha");
    const response = await request(app).delete(`/montadoras/${montadora.id}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty("insertId");
  });
});

describe("API de Clientes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await clearDatabase();
    vi.resetAllMocks();
  });

  it("Deve criar um novo cliente (POST)", async () => {
    vi.mocked(axios.get).mockResolvedValue({
      data: {
        cep: "01001-000",
        logradouro: "Praça da Sé",
        complemento: "lado ímpar",
        bairro: "Sé",
        localidade: "São Paulo",
        uf: "SP",
      },
    });

    const response = await request(app).post("/clientes").send({
      nome: "John Doe",
      cpf: "12345678901",
      cep: "01001000",
      numero: "123",
      complemento: "lado direito",
    });

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty("insertId");
    expect(axios.get).toHaveBeenCalledWith("https://viacep.com.br/ws/01001000/json/");
  });

  it("Deve buscar todos os clientes (GET)", async () => {
    await ClienteFactory.create("Jane Doe", "98765432100", "01001000");

    const response = await request(app).get("/clientes");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("Deve atualizar os dados de um cliente (PUT)", async () => {
    const cliente = await ClienteFactory.create("Bob Burnquist", "55566677788", "01001000");

    vi.mocked(axios.get).mockResolvedValue({
      data: {
        cep: "01001-000",
        logradouro: "Praça da Sé",
        bairro: "Sé",
        localidade: "São Paulo",
        uf: "SP",
      },
    });

    const response = await request(app)
      .put(`/clientes?id=${cliente.id}`)
      .send({
        nome: "Bob Burnquist Editado",
        cpf: "55566677788",
        cep: "01001000",
        numero: "456",
        complemento: "Apto 12",
      });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty("insertId");
  });

  it("Deve deletar um cliente (DELETE)", async () => {
    const cliente = await ClienteFactory.create("Carlos Silva", "99988877766", "01001000");

    const response = await request(app).delete(`/clientes/${cliente.id}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty("insertId");
  });

  it("Deve retornar erro ao tentar cadastrar cliente com CEP inválido", async () => {
    vi.mocked(axios.get).mockRejectedValue(new Error("CEP inválido"));

    const response = await request(app).post("/clientes").send({
      nome: "Teste Erro",
      cpf: "00011122233",
      cep: "00000000",
      numero: "00",
    });

    expect(response.status).toBe(400);
  });
});