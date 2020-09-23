import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Usuario } from '../models/Usuario';
import { UsuariosService } from '../services/usuarios.service';
import { AlertController } from '@ionic/angular';
import { CpfValidator } from '../validators/cpf-validator';

@Component({
  selector: 'app-alterar-usuario',
  templateUrl: './alterar-usuario.page.html',
  styleUrls: ['./alterar-usuario.page.scss'],
})
export class AlterarUsuarioPage implements OnInit {

  public formAlterar: FormGroup;

  public mensagens_validacao = {
    nome: [
      { tipo: 'required', mensagem: 'O campo nome é obrigatório!' },
      { tipo: 'minlength', mensagem: 'O nome deve ter pelo menos 3 caracteres!' }
    ],

    cpf: [
      { tipo: 'required', mensagem: 'O campo CPF é obrigatório!' },
      { tipo: 'minlength', mensagem: 'O CPF deve ter pelo menos 11 caracteres!' },
      { tipo: 'maxlength', mensagem: 'O CPF deve ter no máximo 14 caracteres!' },
      { tipo: 'invalido', mensagem: 'CPF inválido!' }
    ],

    dataNascimento: [
      { tipo: 'required', mensagem: 'O campo data de nascimento é obrigatório!' }
    ],

    genero: [
      { tipo: 'required', mensagem: 'O campo gênero é obrigatório!' }
    ],

    celular: [
      { tipo: 'required', mensagem: 'O campo celular é obrigatório!' },
      { tipo: 'maxlength', mensagem: 'O celular deve ter no máximo 16 números!' }
    ],

    email: [
      { tipo: 'required', mensagem: 'O campo e-mail é obrigatório!' },
      { tipo: 'email', mensagem: 'E-mail inválido!' }
    ],
  };

  private usuario: Usuario;
  private manterLogadoTemp: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private usuariosService: UsuariosService,
    public alertController: AlertController
  ) {

    this.formAlterar = formBuilder.group({
      nome: ['', Validators.compose([Validators.required, Validators.minLength(3)])],
      cpf: ['', Validators.compose([Validators.required, Validators.minLength(11), Validators.maxLength(14), CpfValidator.cpfValido])],
      dataNascimento: ['', Validators.compose([Validators.required])],
      genero: ['', Validators.compose([Validators.required])],
      celular: ['', Validators.compose([Validators.required, Validators.maxLength(16)])],
      email: ['', Validators.compose([Validators.required])]
    });

    this.preencherFormulario();

  }

  ngOnInit() {
  }

  public async preencherFormulario() {
    this.usuario = await this.usuariosService.buscarUsuarioLogado();
    this.manterLogadoTemp = this.usuario.manterLogado;
    delete this.usuario.manterLogado;

    this.formAlterar.setValue(this.usuario);
    this.formAlterar.patchValue({ dataNascimento: this.usuario.dataNascimento.toISOString() });
  }

  public async salvar() { //método salvar
    if (this.formAlterar.valid) { //verifica se formulário está válido
      this.usuario.nome = this.formAlterar.value.nome; //dados do formulário
      this.usuario.dataNascimento = new Date(this.formAlterar.value.dataNascimento); //dados do formulário
      this.usuario.genero = this.formAlterar.value.genero; //dados do formulário
      this.usuario.celular = this.formAlterar.value.celular; //dados do formulário
      this.usuario.email = this.formAlterar.value.email; //dados do formulário

      if(await this.usuariosService.alterar(this.usuario)) { //manda o usuário para alterar
        this.usuario.manterLogado = this.manterLogadoTemp; //devolve a propriedade manter logado
        this.usuariosService.salvarUsuarioLogado(this.usuario); //faz com que usuário tenha os dados atuais
        this.exibirAlerta("SUCESSO!", "Usuário alterado com sucesso!!!") //mensagem de sucesso na alteração
        this.router.navigateByUrl('/configuracoes'); //caminho para tela de configurações
      }
    } else {
      this.exibirAlerta('ADVERTENCIA!', 'Formulário inválido<br/>Verifique os campos do seu formulário!'); //mensagem de possível invalidação de dados
    }
  }

  async exibirAlerta(titulo: string, mensagem: string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensagem,
      buttons: ['OK']
    });

    await alert.present();
  }

}
