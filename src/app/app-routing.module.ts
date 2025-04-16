import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GrabadorComponent } from './components/grabador/grabador.component';

const routes: Routes = [
  { path: '', component: GrabadorComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
