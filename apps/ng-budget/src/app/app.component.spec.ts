import { render } from '@testing-library/angular'
import { AppComponent } from './app.component'

describe('The app component', () => {
    it('should render without error', async () => {
        await render(AppComponent)
    })
})
