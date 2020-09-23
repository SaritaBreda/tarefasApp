import { Injectable } from '@angular/core';
import { ArmazenamentoService } from './armazenamento.service';
import { Usuario } from '../models/Usuario';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  public listaUsuarios = [];

  constructor (private armazenamentoService: ArmazenamentoService) { }

  public async buscarTodos() {
    this.listaUsuarios  = await this.armazenamentoService.pegarDados('usuarios');

    if (!this.listaUsuarios) {
      this.listaUsuarios = [];
    }
  }

  public async salvar(usuario: Usuario) {
    await this.buscarTodos();

    if(!usuario) {
      return false;
    }

    if(!this.listaUsuarios) {
      this.listaUsuarios = [];
    }

    this.listaUsuarios.push(usuario);

    return await this.armazenamentoService.salvarDados('usuarios', this.listaUsuarios);
  }

  public async login(email: string, senha: string) {
    let usuario: Usuario;

    await this.buscarTodos();

    const listaTemporaria = this.listaUsuarios.filter(usuarioArmazenado => {
      return (usuarioArmazenado.email == email && usuarioArmazenado.senha == senha);
    }); //retorna um array;

    if(listaTemporaria.length > 0) {
      usuario = listaTemporaria.reduce(item => item);
    }

    return usuario;
  }

  public salvarUsuarioLogado(usuario: Usuario) {
    delete usuario.senha;
    this.armazenamentoService.salvarDados('usuarioLogado', usuario);
  }

  public async buscarUsuarioLogado() {
    return await this.armazenamentoService.pegarDados('usuarioLogado');
  }

  public async removerUsuarioLogado() {
    return await this.armazenamentoService.removerDados('usuarioLogado');
  }

  public async alterar(usuario: Usuario) { //método alterar
    if(!usuario) { //testando se o usuário é válido
      return false; //inválido retorna falso
  }

  await this.buscarTodos(); //atualiza lista de usuários
  
  const index = this.listaUsuarios.findIndex(usuarioArmazenado => { //método para saber posição do objeto dentro do array
    return usuarioArmazenado.email == usuario.email; //procura no array se possui algum usuario com email igual ao email da alteração
  });

  const usuarioTemporario = this.listaUsuarios[index] as Usuario; //cria usuario temporário na posição encontrada e converte para tipo usuário

  usuario.senha = usuarioTemporario.senha; //recupera a senha do usuário armazenado e coloca no novo objeto sem senha

  this.listaUsuarios[index] = usuario; //chama a lista de usuários na posição procurada e passa o usuário

  return await this.armazenamentoService.salvarDados('usuarios', this.listaUsuarios); //retorna o que vai para o alterar usuário
  }

}
