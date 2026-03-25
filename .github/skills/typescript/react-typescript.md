# React + TypeScript Reference

## Component Props

```ts
// Function component with children
interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const Card: React.FC<CardProps> = ({ title, children, className, onClick }) => (
  <div className={className} onClick={onClick}>
    <h2>{title}</h2>
    {children}
  </div>
);
```

## Event Types

```ts
// Common event handler types
type ChangeHandler = React.ChangeEventHandler<HTMLInputElement>;
type SubmitHandler = React.FormEventHandler<HTMLFormElement>;
type ClickHandler = React.MouseEventHandler<HTMLButtonElement>;
type KeyHandler = React.KeyboardEventHandler<HTMLInputElement>;

// Inline
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};
```

## Hooks

```ts
// useState with explicit type when inference fails
const [user, setUser] = useState<User | null>(null);

// useRef
const inputRef = useRef<HTMLInputElement>(null);
// inputRef.current is HTMLInputElement | null — always check before use

// useReducer with discriminated union
type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset'; payload: number };

function reducer(state: number, action: Action): number {
  switch (action.type) {
    case 'increment': return state + 1;
    case 'decrement': return state - 1;
    case 'reset': return action.payload;
  }
}

// useContext — never pass undefined as default
const ThemeContext = createContext<Theme | null>(null);

function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
}
```

## Custom Hook Pattern

```ts
interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

function useFetch<T>(url: string): UseFetchResult<T> {
  const [state, setState] = useState<UseFetchResult<T>>({
    data: null, loading: true, error: null, refetch: () => {}
  });
  // implementation...
  return state;
}
```

## forwardRef

```ts
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, ...props }, ref) => (
    <label>
      {label}
      <input ref={ref} {...props} />
    </label>
  )
);
Input.displayName = 'Input';
```

## Generic Components

```ts
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, i) => (
        <li key={keyExtractor(item)}>{renderItem(item, i)}</li>
      ))}
    </ul>
  );
}
```

## Component Composition with `as` prop

```ts
type PolymorphicProps<T extends React.ElementType> = {
  as?: T;
  children?: React.ReactNode;
} & React.ComponentPropsWithoutRef<T>;

function Box<T extends React.ElementType = 'div'>({
  as,
  children,
  ...props
}: PolymorphicProps<T>) {
  const Component = as ?? 'div';
  return <Component {...props}>{children}</Component>;
}
```
