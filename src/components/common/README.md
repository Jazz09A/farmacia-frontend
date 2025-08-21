# Componentes para Imágenes de Productos

## ProductPlaceholder

Componente SVG que muestra un placeholder personalizado para productos farmacéuticos cuando no hay imagen disponible.

### Características del diseño:
- 🏥 **Frasco farmacéutico** con tapa y etiqueta
- ➕ **Cruz médica** como símbolo farmacéutico  
- 💊 **Píldoras y cápsulas** decorativas
- 🎨 **Diseño adaptativo** con diferentes tamaños
- 📱 **Responsive** y accesible

### Props:
- `className?: string` - Clases CSS adicionales
- `size?: 'sm' | 'md' | 'lg' | 'xl'` - Tamaño predefinido

### Tamaños disponibles:
- `sm`: 64x64px (4rem x 4rem)
- `md`: 96x96px (6rem x 6rem) - **default**
- `lg`: 128x128px (8rem x 8rem)
- `xl`: 192x192px (12rem x 12rem)

### Ejemplo de uso:

```tsx
import { ProductPlaceholder } from '../components/common';

// Uso básico
<ProductPlaceholder />

// Con tamaño específico
<ProductPlaceholder size="lg" />

// Con clases personalizadas
<ProductPlaceholder 
  size="sm" 
  className="shadow-md border-2 border-blue-200" 
/>
```

## ProductImage

Componente inteligente que muestra imágenes de productos con fallback automático al placeholder.

### Características:
- 🔄 **Fallback automático** cuando no hay imagen o falla la carga
- ⏳ **Loading state** con placeholder mientras carga
- 🚫 **Error handling** automático
- 🎭 **Transiciones suaves** entre estados
- 📦 **Lazy loading** incluido

### Props:
- `src?: string` - URL de la imagen
- `alt: string` - Texto alternativo (requerido)
- `className?: string` - Clases CSS para la imagen
- `size?: 'sm' | 'md' | 'lg' | 'xl'` - Tamaño del placeholder
- `fallbackClassName?: string` - Clases CSS específicas para el placeholder

### Ejemplo de uso:

```tsx
import { ProductImage } from '../components/common';

// Uso básico
<ProductImage 
  src={product.image} 
  alt={product.name}
  className="w-24 h-24 rounded-lg object-cover"
/>

// Con configuración avanzada
<ProductImage 
  src={product.image} 
  alt={product.name}
  size="lg"
  className="w-32 h-32 rounded-xl object-cover shadow-lg"
  fallbackClassName="w-32 h-32 shadow-lg"
/>
```

## Casos de uso recomendados:

### 1. Lista de productos en admin
```tsx
<ProductImage 
  src={product.image} 
  alt={product.name}
  size="sm"
  className="w-12 h-12 rounded-lg object-cover border"
/>
```

### 2. Tarjetas de productos
```tsx
<ProductImage 
  src={product.image} 
  alt={product.name}
  size="lg"
  className="w-full h-48 object-cover rounded-t-lg"
/>
```

### 3. Vista detalle de producto
```tsx
<ProductImage 
  src={product.image} 
  alt={product.name}
  size="xl"
  className="w-full max-w-md h-64 object-cover rounded-xl shadow-xl"
/>
```

### 4. Solo placeholder (sin imagen)
```tsx
<ProductPlaceholder 
  size="md" 
  className="mx-auto shadow-sm" 
/>
```
