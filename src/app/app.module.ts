import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GrabadorComponent } from './components/grabador/grabador.component';
import { PruebasComponent } from './components/pruebas/pruebas.component';

@NgModule({
  declarations: [
    AppComponent,
    GrabadorComponent,
    PruebasComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule 
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
