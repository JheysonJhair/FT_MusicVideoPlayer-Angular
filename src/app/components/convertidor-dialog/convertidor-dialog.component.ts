import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { VideoService } from 'src/app/services/video.service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-convertidor-dialog',
  templateUrl: './convertidor-dialog.component.html',
  styleUrls: ['./convertidor-dialog.component.css'],
})
export class ConvertidorDialogComponent {
  addVideo: FormGroup;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private _videoService: VideoService,
    public dialogRef: MatDialogRef<ConvertidorDialogComponent>
  ) {
    this.addVideo = this.fb.group({
      url: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(https?:\/\/)?[\w\-]+(\.[\w\-]+)+[/#?]?.*$/),
        ],
      ],
    });
  }
  //--------------------------------------------------------------------ABRIR Y CERRAR DIALOG
  closeDialog(): void {
    this.dialogRef.close();
  }

  submitForm(): void {
    const videoData = {
      url: this.addVideo?.get('url')?.value,
    };
    this.descargarVideo(videoData.url);
    this.dialogRef.close();
  }
  //-------------------------------------------------------------------------DESCARGAR VIDEO
  descargarVideo(url: any) {
    console.log('Descargando video...');
    this._videoService.descargarVideo(url).subscribe(
      () => {
        this.toastr.success('Descarga completada!', 'Enhorabuena!');
      },
      (error) => {
        this.toastr.error('No se pudo descargar tu video', 'Error!');
      }
    );
  }
}
