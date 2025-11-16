import './App.css';
import { Button } from './components/ui/button';
import { Separator } from './components/ui/separator';

function App() {
  return (
    <div className="app p-8 space-y-4">
      <h1 className="text-2xl font-bold">Proyecto IX - G3 Data Scientist IA Developer</h1>
      
      <Separator />
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Button Component</h2>
        <div className="flex gap-4 flex-wrap">
          <Button>Default Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex gap-4 flex-wrap">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Separator Component</h2>
        <div>
          <p>Horizontal separator:</p>
          <Separator className="my-4" />
          <p>Vertical separator (in a flex container):</p>
          <div className="flex items-center gap-4 h-20">
            <span>Left</span>
            <Separator orientation="vertical" />
            <span>Right</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
