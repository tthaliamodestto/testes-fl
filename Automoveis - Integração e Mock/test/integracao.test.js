import app from "../src/app.js";

import request from "supertest";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MontadoraFactory } from "./factories/MontadoraFactory.js";

import { ClienteFactory } from "./factories/ClienteFactory.js";

import { VeiculoFactory } from "./factories/VeiculoFactory.js";

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

  //TESTES DE ERRO (Montadoras)

  it("[ERRO] Deve retornar erro ao tentar cadastrar montadora sem campos obrigatórios (POST)", async () => {
    const response = await request(app).post("/montadoras").send({});

    expect(response.status).toBe(400);
  });

  it("[ERRO] Deve retornar erro ao tentar deletar uma montadora inexistente (DELETE)", async () => {
    const response = await request(app).delete(`/montadoras/999999`);

    expect(response.status).toBe(404);
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

  //TESTES DE ERRO (Clientes)

  it("[ERRO] Deve retornar erro ao tentar cadastrar cliente com CEP inválido (Mock do Axios rejeitado)", async () => {
    vi.mocked(axios.get).mockRejectedValue(new Error("CEP inválido"));

    const response = await request(app).post("/clientes").send({
      nome: "Teste Erro",
      cpf: "00011122233",
      cep: "00000000",
      numero: "00",
    });

    expect(response.status).toBe(400);
  });

  it("[ERRO] Deve retornar erro ao tentar cadastrar cliente sem campos obrigatórios (POST)", async () => {
    const response = await request(app).post("/clientes").send({});

    expect(response.status).toBe(400);
  });
});

describe("API de Veículos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await clearDatabase();
    vi.resetAllMocks();
  });

  it("Deve criar um novo veículo (POST)", async () => {
    const cliente = await ClienteFactory.create("Ana Maria", "11122233344", "01001000");
    const montadora = await MontadoraFactory.create("Honda", "Japão");

    const response = await request(app).post("/veiculos").send({
      modelo: "Civic",
      placa: "ABC-1234",
      ano: 2022,
      cor: "Prata",
      valor: 95000.0,
      idCliente: cliente.id,
      idMontadora: montadora.id,
    });

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty("insertId");
  });

  it("Deve buscar todos os veículos (GET)", async () => {
    const cliente = await ClienteFactory.create("Ana Maria", "11122233344", "01001000");
    const montadora = await MontadoraFactory.create("Honda", "Japão");
    await VeiculoFactory.create("Civic", "ABC-1234", 2022, "Prata", 95000.0, cliente.id, montadora.id);

    const response = await request(app).get("/veiculos");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it("Deve atualizar os dados de um veículo (PUT)", async () => {
    const cliente = await ClienteFactory.create("Ana Maria", "11122233344", "01001000");
    const montadora = await MontadoraFactory.create("Honda", "Japão");
    const veiculo = await VeiculoFactory.create("Civic", "ABC-1234", 2022, "Prata", 95000.0, cliente.id, montadora.id);

    const response = await request(app)
      .put(`/veiculos?id=${veiculo.id}`)
      .send({
        modelo: "Civic Touring",
        placa: "ABC-1234",
        ano: 2023,
        cor: "Preto",
        valor: 110000.0,
        idCliente: cliente.id,
        idMontadora: montadora.id,
      });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty("insertId");
  });

  //TESTES DE ERRO (Veículos)

  it("[ERRO] Deve retornar erro ao tentar cadastrar veículo sem campos obrigatórios (POST)", async () => {
    const response = await request(app).post("/veiculos").send({});

    expect(response.status).toBe(400);
  });

  it("[ERRO] Deve retornar erro ao tentar deletar um veículo inexistente (DELETE)", async () => {
    const response = await request(app).delete(`/veiculos/999999`);

    expect(response.status).toBe(404);
  });
});