import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DashboardService } from '../../feature/panel/dashboard/dashboard.service';

@Component({
  selector: 'app-header',
  standalone:true,
  imports: [FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private dashboard = inject(DashboardService);
  idMes = this.dashboard.getMouth();

  

  changeMouth(){
    if(!this.idMes){
      const defaultIdMes = this.dashboard.getMouth();
      this.idMes = defaultIdMes
      setTimeout(()=>{this.idMes = defaultIdMes}, 0);
    }
    this.dashboard.mesSelect$.next(this.idMes);
  }

}
