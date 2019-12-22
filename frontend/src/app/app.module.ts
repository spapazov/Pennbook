import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { TagInputModule } from 'ngx-chips';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { ProfileComponent } from './profile/profile.component';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { SignInComponent } from './sign-in/sign-in.component';
import { FeedComponent } from './feed/feed.component';
import { FriendsComponent } from './friends/friends.component';
import { ChatComponent } from './chat/chat.component';
import { VisualizerComponent } from './visualizer/visualizer.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthGuard } from './guard/guard.service';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { SocketService } from './sockets/socket.service';
import { ApiService } from './api/api.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FriendComponent } from './friends/friend/friend.component';
import { CreatePost } from './create-post/create-post.component';
import { Post } from './post/post.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ProfilePicture } from './profile-picture/profile-picture.component';
import { StringEditor } from './string-editor/string-editor.component';
import { InterestFeedComponent } from './interest-feed/interest-feed.component';
import { AffiliationFeedComponent } from './affiliation-feed/affiliation-feed.component';
import { LoadingComponent } from './loading/loading.component';



@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ProfileComponent,
    SignInComponent,
    FeedComponent,
    FriendsComponent,
    FriendComponent,
    ChatComponent,
    CreatePost,
    Post,
    VisualizerComponent,
    ProfilePicture,
    StringEditor,
    InterestFeedComponent,
    AffiliationFeedComponent,
    LoadingComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgbModule,
    TagInputModule,
    BrowserAnimationsModule,
    NgxGraphModule,
    FontAwesomeModule
  ],
  providers: [AuthGuard, SocketService, ApiService],
  bootstrap: [AppComponent]
})
export class AppModule { }
