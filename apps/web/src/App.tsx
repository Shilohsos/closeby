import { Switch, Route } from 'wouter';
import Navbar from './components/Navbar.tsx';

// Pages
import Home from './pages/Home.tsx';
import Browse from './pages/Browse.tsx';
import ListingDetail from './pages/ListingDetail.tsx';
import CreateListing from './pages/CreateListing.tsx';
import Storefront from './pages/Storefront.tsx';
import Profile from './pages/Profile.tsx';
import HushLanding from './pages/HushLanding.tsx';
import EventDetail from './pages/EventDetail.tsx';
import PostEvent from './pages/PostEvent.tsx';
import BuyTicket from './pages/BuyTicket.tsx';
import TicketReceipt from './pages/TicketReceipt.tsx';
import SignIn from './pages/SignIn.tsx';
import SignUp from './pages/SignUp.tsx';
import ResetPassword from './pages/ResetPassword.tsx';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <main className="pt-16">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/browse" component={Browse} />
          <Route path="/listing/:id" component={ListingDetail} />
          <Route path="/create" component={CreateListing} />
          <Route path="/store/:userId" component={Storefront} />
          <Route path="/profile" component={Profile} />
          <Route path="/hush" component={HushLanding} />
          <Route path="/hush/event/:id" component={EventDetail} />
          <Route path="/hush/event/:id/buy" component={BuyTicket} />
          <Route path="/hush/ticket/:referenceCode" component={TicketReceipt} />
          <Route path="/hush/post" component={PostEvent} />
          <Route path="/signin" component={SignIn} />
          <Route path="/signup" component={SignUp} />
          <Route path="/reset-password" component={ResetPassword} />
        </Switch>
      </main>
    </div>
  );
}
