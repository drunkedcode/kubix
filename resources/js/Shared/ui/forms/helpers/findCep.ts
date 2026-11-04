// src/Shared/helpers/findCep.ts

export interface CepAddressResponse {
    cep: string;
    street: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
}

export async function findCep(cepRaw: string): Promise<CepAddressResponse | null> {
    const cleanCep = cepRaw.replace(/\D/g, "");
    
    if (cleanCep.length !== 8) {
        return null;
    }

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        if (!response.ok) throw new Error("Erro na requisição da API de CEP");

        const data = await response.json();
        
        if (data.erro) {
            return null;
        }

        return {
            cep: cleanCep,
            street: data.logradouro || "",
            complement: data.complemento || "",
            neighborhood: data.bairro || "",
            city: data.localidade || "",
            state: data.uf || "",
        };
    } catch (err) {
        console.error("Erro ao buscar CEP:", err);
        throw err;
    }
}