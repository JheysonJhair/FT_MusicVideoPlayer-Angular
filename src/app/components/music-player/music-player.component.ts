import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators,AbstractControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { dtoVideo } from 'src/app/interfaces/Video';
import { ActivatedRoute, Router } from '@angular/router';
import { VideoService } from 'src/app/services/video.service';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-music-player',
  templateUrl: './music-player.component.html',
  styleUrls: ['./music-player.component.css'],
})
export class MusicPlayerComponent implements OnInit {
  defaultVideoUrl: string = "https://youtu.be/DXV79KHSftc";
  safeVideoUrl: SafeResourceUrl; // URL segura del video

  //Listar videos
  listVideo: dtoVideo[] = [];

  //ADD - EDIT Videos
  addVideo: FormGroup;
  accion = 'Registrar';
  id = '';
  str2 = null;
  dtoVideo: dtoVideo | undefined;

  constructor(
    private formBuilder: FormBuilder,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder,
    private router: Router,
    private _videoService: VideoService,
    private aRoute: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.addVideo = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      url: ['', [Validators.required, ]]
    });
    this.id = this.aRoute.snapshot.paramMap.get('id')!;
  }

  ngOnInit(): void {
    this.ver(this.defaultVideoUrl);
    this.getVideo();
    this.esEdit();
  }
  //---------------------------------------------------------------LISTAR VIDEO
  getVideo() {
    this._videoService.getListVideo().subscribe(
      (data) => {
        this.listVideo = data.listDtoVideo;
      },
      (error) => {
        this.toastr.error('Opss ocurrio un error', 'Error');
        console.log(error);
      }
    );
  }
  deleteVideo(id: any) {
    this._videoService.deleteVideo(id).subscribe(
      (data) => {
        this.getVideo();
        this.toastr.error(
          'El video fue eliminado con exito',
          'Registro eliminado!'
        );
        this.router.navigate([' ']);
      },
      (error) => {
        this.toastr.error('Opss ocurrio un error', 'Error');
        console.log(error);
      }
    );
  }
  //---------------------------------------------------------------AGREGAR - EDITAR VIDEO
  esEdit() {
    if (this.id !== null) {
      this.accion = 'Editar';
      this._videoService.getVideo(this.id).subscribe(
        (data) => {
          console.log(data);
          this.dtoVideo = data;

          this.addVideo.controls['name'].setValue(data[0].name);
          this.addVideo.controls['description'].setValue(data[0].description);
          this.addVideo.controls['url'].setValue(data[0].url);
        },
        (error) => {
          console.log(error);
        }
      );
    }
  }
  ver(url: string) {
    const videoId = this.extraerVideoId(url);
    this.safeVideoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`);
  }

  extraerVideoId(url: string): string {
    // Extraer el identificador del video de la URL abreviada
    const videoId = url.replace('https://youtu.be/', '');
    return videoId;
  }

  addEditVideo() {
    if (this.dtoVideo == undefined) {
      let formData = new FormData();
      formData.append('dtoVideo.name', this.addVideo?.get('name')?.value);
      formData.append(
        'dtoVideo.description',
        this.addVideo?.get('description')?.value
      );
      formData.append('dtoVideo.url', this.addVideo?.get('url')?.value);

      this._videoService.saveVideo(formData).subscribe(
        (data) => {
          this.getVideo();
          this.toastr.success(
            'El video fue registrado con exito',
            'Registro completo!'
          );
        },
        (error) => {
          this.toastr.error('Opss ocurrio un error', 'Error');
          console.log(error);
        }
      );
    } else {
      let formData = new FormData();
      formData.append('dtoVideo.idVideo', this.id);
      formData.append('dtoVideo.name', this.addVideo.get('name')?.value);
      formData.append(
        'dtoVideo.description',
        this.addVideo.get('description')?.value
      );
      formData.append('dtoVideo.url', this.addVideo.get('url')?.value);

      this._videoService.updateVideo(formData).subscribe(
        (data) => {
          this.getVideo();
          this.toastr.info(
            'El video fue actualizado con exito',
            'Video actualizado!'
          );
          this.router.navigate([' ']);
        },
        (error) => {
          this.toastr.error('Opss ocurrio un error', 'Error');
          console.log(error);
        }
      );
    }
  }
  //
  validateYouTubeUrl(control: AbstractControl): { [key: string]: any } | null {
    const urlPattern = /^https:\/\/youtu\.be\/[a-zA-Z0-9_-]{11}$/;
    const validUrl = urlPattern.test(control.value);

    return validUrl ? null : { invalidUrl: true };
  }

  descargarVideo() {
    const url = 'https://youtu.be/M-qc8lJ9x2o?list=RDM-qc8lJ9x2o'; // Reemplaza esto con la URL del video que deseas descargar

    const link = document.createElement('a');
    link.href = url;
    link.download = 'Triste Payaso.mp4'; // Especifica el nombre del archivo que se descargará

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
