import { Component, NgZone } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonProgressBar } from '@ionic/angular/standalone';
import { Share } from '@capacitor/share';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { CapacitorHttp } from '@capacitor/core';
import { FileOpener } from '@capacitor-community/file-opener';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonProgressBar],
})
export class HomePage {

  // Small PDF
  smallFile = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

  // Large PDF (~25mb)
  largeFile = 'https://research.nhm.org/pdfs/10840/10840.pdf';

  // This is used for the progress bar when downloading a large PDF
  progress = 0;
  downloading = false;

  constructor(ngZone: NgZone) {
    Filesystem.addListener('progress', (progressStatus) => {
      ngZone.run(() => {
        const percentage = progressStatus.bytes / progressStatus.contentLength;
        console.log(percentage);
        this.progress = percentage;
      });
    });
  }

  /**
   * This will download a large PDF file using Filesystem.downloadfile and share it.
   * It can download large files (as it doesnt need to send the file to JS) and can show download progress
   */
  async downloadAndShare() {
    const url = this.largeFile;
    this.downloading = true;
    const { path } = await Filesystem.downloadFile({ directory: Directory.Cache, path: 'mypdf.pdf', url, progress: true });
    if (!path) {
      throw new Error(`Unable to download ${url}`);
    }
    this.downloading = false;

    await Share.share(
      {
        title: 'Share PDF',
        text: 'Share the PDF',
        files: [path]
      }
    );
  }


  /**
   * This will download a small PDF file using CapacitorHttp and share it.
   * This has the caveat of being more limited with file sizes.
   */
  async getAndShare() {
    const url = this.smallFile;
    const { data } = await CapacitorHttp.get({ url, responseType: 'blob' });

    const { uri } = await Filesystem.writeFile({
      path: 'my-pdf.pdf',
      data,
      directory: Directory.Cache,
      // Important: We dont set encoding as the default encoding is suitable for CapacitorHttp's blob response type.
      //encoding: Encoding.UTF8,
    });

    await Share.share(
      {
        title: 'Share PDF',
        text: 'Share the PDF',
        files: [uri]
      }
    );
  }


  /**
   * This will download a PDF file and open it using @capacitor-community/file-opener
   */
  async downloadAndOpen() {
    const url = this.smallFile;
    const { data } = await CapacitorHttp.get({ url, responseType: 'blob' });
    const { path } = await Filesystem.downloadFile({ directory: Directory.Cache, path: 'mypdf.pdf', url });
    if (!path) {
      throw new Error(`Unable to download ${url}`);
    }
    await FileOpener.open({
      filePath: path,
      openWithDefault: true
    });

  }
}
