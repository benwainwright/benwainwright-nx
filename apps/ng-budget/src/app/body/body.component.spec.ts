import { bootstrapComponent } from '../../testing-utils/bootstrap-component';
import { BodyComponent } from './body.component';

describe('BodyComponent', () => {
  it('should create', () => {
    const component = bootstrapComponent(BodyComponent);
    expect(component).toBeTruthy();
  });
});
