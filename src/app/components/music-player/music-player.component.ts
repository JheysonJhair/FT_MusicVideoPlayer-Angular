import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { dtoMusic } from 'src/app/interfaces/Music';

import { MusicService } from 'src/app/services/music.service';
import { HttpClient } from '@angular/common/http';

import { VideoService } from 'src/app/services/video.service';

import { LoginService } from 'src/app/services/login.service';
import { ActivatedRoute } from '@angular/router';
import { User } from 'src/app/interfaces/User';
@Component({
  selector: 'app-music-player',
  templateUrl: './music-player.component.html',
  styleUrls: ['./music-player.component.css'],
})
export class MusicPlayerComponent implements OnInit {
  visible: boolean = true;
  src: String;
  listMusic: dtoMusic[] = [];

  mostrarComponente = true;
  des: boolean = false;

  selectedFile: File;
  usuario2: User;
  usuario: any;
  isMenuOpen = false;

  title: string = 'Sound Thezer';
  subtitle: string = '';

  idUser: any;
  id: any;

  addMusic: FormGroup;
  dtoMusic: dtoMusic | undefined;

  selectedVideoId: string;

  constructor(
    private aRoute: ActivatedRoute,
    private _loginService: LoginService,
    private fb: FormBuilder,
    private http: HttpClient,
    private _videoService: VideoService,
    private _musicService: MusicService,
    private toastr: ToastrService
  ) {
    this.handleResize();
    this.addMusic = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      url: ['', [Validators.required]],
    });
    this.idUser = this.aRoute.snapshot.paramMap.get('id')!;
    this.id = this.aRoute.snapshot.paramMap.get('idVideo')!;
  }

  ngOnInit(): void {
    this.getMusic();
    this.getUser();
  }

  //-------------------------------------------------------------------------TRAER USUARIO

  getUser() {
    this._loginService.getUser(this.idUser).subscribe((data) => {
      this.usuario2 = data.result;
    });
  }

  //-------------------------------------------------------------------------LISTAR MUSICA

  getMusic() {
    this._musicService.getListMusic().subscribe(
      (data) => {
        this.listMusic = data.result;
      },
      (error) => {
        this.toastr.error('Opss ocurrio un error', 'Error');
        console.log(error);
      }
    );
  }

  //-------------------------------------------------------------------------ELIMINAR MUSICA

  deleteMusic(videoId: any | undefined) {
    if (videoId) {
      this.selectedVideoId = videoId;
    }
    this._videoService.getVideo(this.selectedVideoId).subscribe((data) => {
      this.listMusic = data.result;
      const videoJSON = {
        name: data.result.name,
        description: data.result.description,
        url: data.result.url,
        state: false,
      };
      this._videoService.updateVideo(videoId, videoJSON).subscribe();
    });
    this._musicService.deleteMusic(videoId).subscribe(
      (data) => {
        this.getMusic();
        this.toastr.error(
          'La música fue eliminado con exito',
          'Registro eliminado!'
        );
      },
      (error) => {
        this.toastr.error('Opss ocurrio un error', 'Error');
        console.log(error);
      }
    );
  }

  //-------------------------------------------------------------------------DESCARGAR MUSICA

  descargarAudioUsuario(id: any) {
    this.des = true;
    console.log('Descargando..');
    this.http
      .get('https://soundthezerb.ccontrolz.com/api/musics/downloadById/' + id, {
        responseType: 'blob',
      })
      .subscribe(
        (response) => {
          const url = window.URL.createObjectURL(response);
          console.log('Descargando...');
          this.toastr.success('Descarga completada!', 'Enhorabuena!');
          const link = document.createElement('a');
          link.href = url;
          link.download = 'MiMusica.mp3';
          link.click();

          window.URL.revokeObjectURL(url);
          this.des = false;
        },
        (error) => {
          this.toastr.error('No se pudo descargar tu musica', 'Error!');
        }
      );
  }
  //------------------------------------------------------------------------------REPRODUCIR MUSICA

  playMusic(id: any): void {
    this._musicService.playMusicById(id).subscribe(
      (blob: Blob) => {
        this.visible = false;
        this.src = URL.createObjectURL(blob);
      },
      (error) => {
        console.error('Error al traer la música:', error);
      }
    );
  }
  traerMusica(id: any) {
    this._musicService.getMusic(id).subscribe((data) => {
      this.title = data.result.name;
      this.subtitle = data.result.description;
    });
  }

  //-------------------------------------------------------------------------REPRODUCIR MUSICA LOCAL

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.visible = true;
    this.src = URL.createObjectURL(file);
    this.visible = false;
  }

  playAudio(): void {
    const audioElement = document.getElementById(
      'custom-audio'
    ) as HTMLAudioElement;
    audioElement.play();
  }

  pauseAudio(): void {
    const audioElement = document.getElementById(
      'custom-audio'
    ) as HTMLAudioElement;
    audioElement.pause();
  }

  stopAudio(): void {
    const audioElement = document.getElementById(
      'custom-audio'
    ) as HTMLAudioElement;
    audioElement.pause();
    audioElement.currentTime = 0;
  }

  //--------------------------------------------------------------------------MENU

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.handleResize();
  }

  handleResize() {
    this.mostrarComponente = window.innerWidth > 1025;
  }

  toggleComponente() {
    this.mostrarComponente = !this.mostrarComponente;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
